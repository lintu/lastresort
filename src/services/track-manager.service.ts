import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { FirebaseHelperService } from './firebase-helper.service';
import { Track, ActiveTrack } from '../classes/track';

@Injectable()
export class TrackManagerService {

    public userTracksSubscription: Subscription; 
    public userPlaylistSubscription: Subscription; 
    public loginSubscription: Subscription;
    public userTrackListChangeSubject$: Subject<Array<Track>>;
    public activeTrackChangeSubject$: Subject<ActiveTrack>;

    public userTracks: Array<Track>;
    public activeTrack: ActiveTrack;

    public activePlaylist: string;

    constructor(public firebaseHelper: FirebaseHelperService) {
        this.userTracks = [];
        this.userTracksSubscription = new Subscription();
        this.userPlaylistSubscription = new Subscription();
        this.userTrackListChangeSubject$ = new Subject<Array<Track>>();
        this.activeTrackChangeSubject$ = new Subject<ActiveTrack>();
        this.activePlaylist = 'default';

        this.loginSubscription = this.firebaseHelper.loginSubject$.subscribe((loginDetails) => {
            if(loginDetails['isLoggedIn']) {
                this.startUserTracksSubscription();
                this.startUserPlaylistSubscription();
            }
            else {
                this.stopUserTracksSubscription();
            }
        });
    }

    setActiveTrack(track: Track) {
        this.activeTrack = new ActiveTrack(track);
        this.activeTrackChangeSubject$.next(this.activeTrack);
    }

    private stopUserTracksSubscription() {
        this.userTracks = [];
        this.userTrackListChangeSubject$.next(this.userTracks);
        this.userTracksSubscription.unsubscribe();
    }
    
    private startUserTracksSubscription() {
        this.userTracksSubscription = this.firebaseHelper.userSongsSubject$.subscribe((userSongs) => {
            this.userTracks = userSongs;
            this.userTrackListChangeSubject$.next(this.userTracks);
        });
    }

    private startUserPlaylistSubscription() {
        this.userPlaylistSubscription = this.firebaseHelper.userSongsSubject$.subscribe((userSongs) => {
            this.userTracks = userSongs;
            this.userTrackListChangeSubject$.next(this.userTracks);
        });
    }
}