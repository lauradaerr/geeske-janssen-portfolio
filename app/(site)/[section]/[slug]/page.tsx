import Link from "next/link";
import { notFound } from "next/navigation";
import ImageGrid from "@/components/ImageGrid";
import Markdown from "@/components/Markdown";
import VideoPlayer from "@/components/VideoPlayer";
import Bi from "@/components/Bi";
import { getAllWorks, getWork, getAdjacent, getSection, themeClass, imgSrc } from "@/lib/content";
import { splitLang, sectionLabelEn } from "@/lib/i18n";

export async function generateStaticParams() {
  return (await getAllWorks()).map((w) => ({ section: w.section, slug: w.slug }));
}

export default async function WorkPage({ params }: { params: Promise<{ section: string; slug: string }> }) {
  const { section, slug } = await params;
  const work = await getWork(section, slug);
  if (!work) notFound();
  const sec = (await getSection(section))!;
  const { next } = await getAdjacent(section, slug);
  const title = splitLang(work.title);
  const nextTitle = next ? splitLang(next.title) : null;

  return (
    <article className={`themed ${themeClass(section)}`}>
      <div className="pad">
        <div className="work__top">
          <Link href={`/${section}`} className="work__link work__link--back">← <Bi de={sec.label} en={sectionLabelEn(sec.key, sec.label)} /></Link>
          {next && nextTitle && (
            <Link href={`/${next.section}/${next.slug}`} className="work__link work__link--next"><Bi de={nextTitle.de} en={nextTitle.en} /> →</Link>
          )}
        </div>

        <h1 className="work__title"><Bi de={title.de} en={title.en} /></h1>
        <div className="work__metarow">
          <span className="mono"><Bi de={sec.label} en={sectionLabelEn(sec.key, sec.label)} /></span>
          {work.images.length > 0 && <span className="mono"><Bi de={`${work.images.length} Abbildungen`} en={`${work.images.length} images`} /></span>}
        </div>

        <ImageGrid
          images={work.images}
          alt={title.de}
          credits={work.images.map((p) => work.imageCredits?.[p])}
          sizes={work.images.map((p) => work.imageSizes?.[p])}
          lead={
            <>
              {work.description && <Markdown source={work.description} className="work__desc md" />}
              {work.videoUrl && (
                <div className="work__video">
                  <VideoPlayer url={work.videoUrl} poster={work.cover ? imgSrc(work.cover) : undefined} title={title.de} />
                </div>
              )}
              {work.text && <Markdown source={work.text} className="work__text md" />}
            </>
          }
        />

        {!work.videoUrl && work.images.length === 0 && (
          <p className="mono" style={{ padding: "1.4rem 0 4rem" }}><Bi de="Keine Abbildungen hinterlegt." en="No images yet." /></p>
        )}
      </div>
    </article>
  );
}
