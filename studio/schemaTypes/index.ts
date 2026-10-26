import {richText} from './blocks/rich-text'
import {aboutRow} from './objects/about-row'
import {galleryCard} from './objects/gallery-card'
import {galleryRow} from './objects/gallery-row'
import {playlistTrack} from './objects/playlist-track'
import {priceItem} from './objects/price-item'
import {socialLink} from './objects/social-link'
import {aboutPage} from './documents/about-page'
import {commissionPage} from './documents/commission-page'
import {galleryPage} from './documents/gallery-page'
import {homePage} from './documents/home-page'
import {musicPlaylist} from './documents/music-playlist'
import {siteSettings} from './documents/site-settings'

export const schemaTypes = [
  richText,
  aboutRow,
  galleryCard,
  galleryRow,
  playlistTrack,
  priceItem,
  socialLink,
  commissionPage,
  galleryPage,
  aboutPage,
  homePage,
  musicPlaylist,
  siteSettings,
]
