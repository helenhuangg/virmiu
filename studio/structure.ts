import type {StructureResolver} from 'sanity/structure'
import {CogIcon} from '@sanity/icons/Cog'
import {HomeIcon} from '@sanity/icons/Home'
import {ImagesIcon} from '@sanity/icons/Images'
import {PlayIcon} from '@sanity/icons/Play'
import {TagIcon} from '@sanity/icons/Tag'
import {UserIcon} from '@sanity/icons/User'

/**
 * Every type is a singleton: one document per page, opened straight from the sidebar
 * so there is no document list to get lost in and nothing new to create by accident.
 */
const singletons = [
  {type: 'commissionPage', title: 'Commission page', icon: TagIcon},
  {type: 'galleryPage', title: 'Gallery page', icon: ImagesIcon},
  {type: 'aboutPage', title: 'About page', icon: UserIcon},
  {type: 'homePage', title: 'Home page', icon: HomeIcon},
  {type: 'musicPlaylist', title: 'Music player', icon: PlayIcon},
  {type: 'siteSettings', title: 'Site settings', icon: CogIcon},
]

export const singletonTypes = new Set(singletons.map((item) => item.type))

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items(
      singletons.map(({type, title, icon}) =>
        S.listItem()
          .id(type)
          .title(title)
          .icon(icon)
          .child(S.document().schemaType(type).documentId(type).title(title)),
      ),
    )
