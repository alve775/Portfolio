import { CvView } from '@/components/CvView';
import { getPapers, getProjects } from '@/lib/content';
import { hasCvPdf } from '@/lib/cv';
import { routeMetadata } from '@/lib/seo';
import { copy, cvContent } from '@/lib/site';

export const metadata=routeMetadata({title:copy.cv,description:copy.cvDescription,pathname:'/cv/'});
export default function CvPage(){
  const papers=getPapers(), projects=getProjects();
  const selectedProjects=cvContent.projectSlugs.flatMap(slug=>{const project=projects.find(p=>p.slug===slug);return project?[project]:[];});
  return <CvView publications={papers.filter(p=>p.frontmatter.status==='published')} projects={selectedProjects} hasPdf={hasCvPdf()} />;
}
