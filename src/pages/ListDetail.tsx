import { Navigate, useParams } from 'react-router'
import PageHeader from '../components/PageHeader'
import { Art, Muted, SeeAll } from '../components/ui'
import { LISTS } from '../lib/lists'

/** Henüz kendi ekranı olmayan listeler için ortak sayfa. */
export default function ListDetail() {
  const { slug } = useParams()
  const list = LISTS.find((l) => l.slug === slug)
  if (!list) return <Navigate to="/listeler" replace />

  return (
    <>
      <PageHeader title={list.title} subtitle={list.subtitle} />
      <section className="card flex flex-col items-center gap-3 px-4 py-6 text-center">
        {list.art && <Art name={list.art} className="w-[55%] max-w-[220px]" />}
        <Muted>Bu liste henüz boş. Kayıt ekleme çok yakında burada olacak.</Muted>
        <SeeAll to="/listeler">Listelere dön</SeeAll>
      </section>
    </>
  )
}
