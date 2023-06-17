'use client'

import { useEffect } from 'react'
import { Balancer } from 'react-wrap-balancer'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { useParams } from 'next/navigation'
import type { Image } from '@mx-space/api-client'
import type { MarkdownToJSX } from '~/components/ui/markdown'

import { PageDataHolder } from '~/components/common/PageHolder'
import { useSetHeaderMetaInfo } from '~/components/layout/header/internal/hooks'
import { Loading } from '~/components/ui/loading'
import { Markdown } from '~/components/ui/markdown'
import { Toc, TocAutoScroll } from '~/components/widgets/toc'
import { useBeforeMounted } from '~/hooks/common/use-before-mounted'
import { useNoteByNidQuery } from '~/hooks/data/use-note'
import { ArticleElementProvider } from '~/providers/article/article-element-provider'
import { MarkdownImageRecordProvider } from '~/providers/article/markdown-image-record-provider'
import { useSetCurrentNoteId } from '~/providers/note/current-note-id-provider'
import { NoteLayoutRightSidePortal } from '~/providers/note/right-side-provider'

import styles from './page.module.css'

const noopArr = [] as Image[]

const PageImpl = () => {
  const { id } = useParams() as { id: string }
  const { data } = useNoteByNidQuery(id)

  const setNoteId = useSetCurrentNoteId()
  useBeforeMounted(() => {
    setNoteId(id)
  })

  const note = data?.data
  const setHeaderMetaInfo = useSetHeaderMetaInfo()
  useEffect(() => {
    if (!note?.title) return
    setHeaderMetaInfo({
      title: note?.title,
      description: `手记${note.topic?.name ? ` / ${note.topic?.name}` : ''}`,
      slug: note?.nid.toString(),
    })
  }, [note?.nid, note?.title, note?.topic?.name])

  if (!note) {
    return <Loading useDefaultLoadingText />
  }

  // const mardownResult = parseMarkdown(note.text ?? '')

  // Why do this, I mean why do set NoteId to context, don't use `useParams().id` for children components.
  // Because any router params or query changes, will cause components that use `useParams()` hook, this hook is a context hook,
  // For example, `ComA` use `useParams()` just want to get value `id`,
  // but if router params or query changes `page` params, will cause `CompA` re - render.

  const dateFormat = dayjs(data?.data.created)
    .locale('cn')
    .format('YYYY 年 M 月 D 日 dddd')

  return (
    <article
      className={clsx('prose', styles['with-indent'], styles['with-serif'])}
    >
      <header>
        <h1 className="mt-8 text-left font-bold text-base-content/95">
          <Balancer>{note.title}</Balancer>
        </h1>

        <span className="inline-flex items-center text-[13px] text-neutral-content/60">
          <time className="font-medium" suppressHydrationWarning>
            {dateFormat}
          </time>
        </span>
      </header>

      <ArticleElementProvider>
        <MarkdownImageRecordProvider images={note.images || noopArr}>
          <Markdown as="main" renderers={Markdownrenderers} value={note.text} />
        </MarkdownImageRecordProvider>

        <NoteLayoutRightSidePortal>
          <Toc className="sticky top-[120px] ml-4 mt-[120px]" />
          <TocAutoScroll />
        </NoteLayoutRightSidePortal>
      </ArticleElementProvider>
    </article>
  )
}

const Markdownrenderers: { [name: string]: Partial<MarkdownToJSX.Rule> } = {
  text: {
    react(node, _, state) {
      return (
        <span className="indent" key={state?.key}>
          {node.content}
        </span>
      )
    },
  },
}
export default PageDataHolder(PageImpl, () => {
  const { id } = useParams() as { id: string }
  return useNoteByNidQuery(id)
})
