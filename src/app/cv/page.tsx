import Link from 'next/link';

import { Field } from '@/components/Field';
import { PageHeader } from '@/components/PageHeader';
import { ProfileLinks } from '@/components/ProfileLinks';
import { getPapers } from '@/lib/content';
import { hasCvPdf } from '@/lib/cv';
import { routeMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata = routeMetadata({
  title: 'Curriculum vitae',
  description: `Curriculum vitae for ${site.name}.`,
  pathname: '/cv/',
});

export default function CvPage() {
  const papers = getPapers();
  const publications = papers.filter(({ frontmatter }) => frontmatter.status === 'published');
  const thesis = papers.find(({ frontmatter }) => frontmatter.status === 'thesis');

  return (
    <>
      <PageHeader title="Curriculum vitae" lede="Junior Machine Learning Engineer · Bangla & Multilingual NLP · Transformers">
        {hasCvPdf() ? (
          <p className="page-action">
            <a
              className="primary-link"
              href="/cv.pdf"
              download
            >
              Download PDF ↓
            </a>
          </p>
        ) : null}
      </PageHeader>

      <div className="cv-grid" data-cv-grid>
        <Field label="Profile">
          <p>
            CSE graduate from RUET with a CGPA of 3.71/4.00, two peer-reviewed NLP
            publications, and hands-on experience fine-tuning and evaluating
            Transformer models. My work includes Bangla sentence classification,
            local retrieval pipelines, and leakage-safe machine learning experiments.
          </p>
          <p className="meta field-meta">{site.location}</p>
          <ProfileLinks variant="inline" />
        </Field>
        <Field label="Education">
          <h3>B.Sc. in Computer Science and Engineering</h3>
          <p className="meta field-meta">
            {site.affiliation} · 2022–2026
          </p>
          <p>CGPA: 3.71/4.00</p>
        </Field>
        <Field label="Technical skills">
          <dl className="cv-skills">
            <div><dt>Machine learning & NLP</dt><dd>Python, PyTorch, Hugging Face Transformers, scikit-learn, XLM-R, BanglaBERT, SahajBERT, mBERT, fine-tuning, text classification.</dd></div>
            <div><dt>LLMs & retrieval</dt><dd>LangChain, Ollama, ChromaDB, embeddings, retrieval-augmented generation, local LLM pipelines.</dd></div>
            <div><dt>Evaluation & data</dt><dd>pandas, NumPy, preprocessing, stratified splitting, cross-validation, benchmarking, failure analysis, bootstrap and permutation testing.</dd></div>
            <div><dt>Engineering</dt><dd>Git, Linux, Jupyter, Gradio, REST APIs, JavaScript, TypeScript, Next.js.</dd></div>
          </dl>
        </Field>
        <Field label="Experience">
          <div className="cv-entries">
            <article>
              <h3>Independent NLP research</h3>
              <p className="meta field-meta">Bangla & multilingual NLP · 2024–present</p>
              <ul>
                <li>Benchmarked six monolingual and multilingual Transformer encoders on a 25,500-sentence, five-class Bangla dataset and deployed an XLM-R classifier on Hugging Face.</li>
                <li>Co-developed a unified vocabulary-difficulty prediction pipeline for three L1 groups in the BEA 2026 Shared Task.</li>
              </ul>
            </article>
            <article>
              <h3>Research member</h3>
              <p className="meta field-meta">Young Learners&apos; Research Lab, RUET · 2024–present</p>
              <p>Collaborative AI/NLP research, seminars, and experiment review under faculty supervision, spanning low-resource NLP and biomedical machine learning.</p>
            </article>
            <article>
              <h3>Undergraduate thesis · ADHD EEG analysis</h3>
              <p className="meta field-meta">RUET CSE · 2025–2026</p>
              <p>Designed subject-level evaluation to investigate participant leakage and confounding, using nested cross-validation and statistical resampling.</p>
              {thesis ? <Link className="link" href={`/research/${thesis.slug}/`}>Read the thesis overview ↗</Link> : null}
            </article>
            <article>
              <h3>Industrial trainee</h3>
              <p className="meta field-meta">Code Studio · 2025</p>
              <p>Requirements analysis, debugging, Git-based collaboration, documentation, and software delivery workflows.</p>
            </article>
          </div>
        </Field>
        <Field label="Selected projects">
          <div className="cv-entries">
            <article><h3>Bangla Sentence Classifier</h3><p>Fine-tuned XLM-R for five grammatical sentence types and deployed a Gradio interface on Hugging Face.</p></article>
            <article><h3>Web-RAG</h3><p>A local webpage-retrieval and LLM question-answering pipeline with persistent vector storage.</p></article>
            <article><h3>Resume Evaluator</h3><p>LLM-assisted resume analysis with PDF/DOCX parsing, ATS scoring, targeted feedback, browser editing, and document export.</p></article>
          </div>
          <Link className="link cv-index-link" href="/projects/">View projects and repositories ↗</Link>
        </Field>
        <Field label="Publications">
          <ol className="cv-publications">
            {publications.map(({ slug, frontmatter }) => (
              <li key={slug}>
                <Link className="link" href={`/research/${slug}/`}>{frontmatter.title}</Link>
                <p>{frontmatter.authors.join(', ')}</p>
                <p className="meta field-meta">{frontmatter.venue} · Published</p>
              </li>
            ))}
          </ol>
        </Field>
      </div>
    </>
  );
}
