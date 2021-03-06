// Written by Dr. Zub
import { Component } from '@angular/core';
import { NavController, NavParams, App, ToastController } from 'ionic-angular';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RssProvider } from '../../providers/rss/rss';
import { ReadPage } from '../read/read';
import { DatabaseProvider } from '../../providers/database/database';
import { SocialSharing } from '@ionic-native/social-sharing';

@Component({
  selector: 'page-mgtv',
  templateUrl: 'mgtv.html',
})
export class MgtvPage {

  title: any;
  nextOffset: number;
  rssMgtv: any = [];
  offset = '20'; 

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public rss: RssProvider,
    public http: HttpClient,
    public app: App,
    public toast: ToastController,
    public database: DatabaseProvider,
    public socialSharing: SocialSharing
  ) {
    this.rss.getMgtv().subscribe(rssFeed => {
      this.rssMgtv = rssFeed;
    });
  }

  openRead(rssData) {
    this.title = 'MGTV';
    this.app.getRootNav().push(ReadPage, {rssData: rssData, title: this.title});
  }

  // Infinity Load method
  doInfinite(load?) {
    let response: any;
    let params = new HttpParams();
    params = params.append('per_page', '10');
    params = params.append('categories', '11');
    params = params.append('_embed', '');
    params = params.append('offset', this.offset);
    response = this.http.get('http://malaysiagazette.com/v2/wp-json/wp/v2/posts', {params: params});
    
    response.subscribe(rssFeed => {
    this.rssMgtv = this.rssMgtv.concat(rssFeed);
      if(load) {
        this.nextOffset = parseInt(this.offset) + 10;
        this.offset = this.nextOffset.toString();
        load.complete();
      }
    });
  }

  // Offline reading functionality
  saveRss(rssData) {    
    let offline = rssData;
    let saveRss = this.toast.create({
      message: 'Artikel disimpan untuk bacaan offline',
      duration: 3000,
      position: 'bottom',
    });
    saveRss.present();
    console.log('Entering database', offline);
    return this.database.getRss(offline);
  }

  shareRss(rssData) {
    var options = {
      message: '',
      subject: '',
      url: rssData.link,
      chooserTitle: 'Kongsi artikel' // Android only, you can override the default share sheet title
    }
    this.socialSharing.shareWithOptions(options).then((res) => {
      console.log('Success!');
    }).catch(() => {
      console.log('Error!');
    });
  }  

  ionViewDidLoad() {
  }

}
