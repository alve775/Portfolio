import { RedesignHeader } from '@/components/RedesignHeader';
import { MiniConstellation } from '@/components/MiniConstellation';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectsExplorer } from '@/components/ProjectsExplorer';
import { EngineeringNotes } from '@/components/EngineeringNotes';
import { Reveal } from '@/components/Reveal';
import { getProjects } from '@/lib/content';
import { routeMetadata } from '@/lib/seo';
import { copy, homeCopy } from '@/lib/site';

export const metadata=routeMetadata({title:copy.projects,description:copy.projectDescription,pathname:'/projects/'});
export default function ProjectsPage(){
  const projects=getProjects().slice(0,5);
  return <div className="inner-page"><RedesignHeader label={`${homeCopy.station} 02 / ${copy.projects}`} title={homeCopy.projectTitle} lead={copy.projectsLead} decoration={<MiniConstellation />} />
    <ProjectsExplorer cards={projects.map(p=>({slug:p.slug,status:p.frontmatter.status,tags:p.frontmatter.tags,view:<Reveal><ProjectCard project={p}>{p.frontmatter.caseStudy&&<EngineeringNotes study={p.frontmatter.caseStudy} initialOpen={p.slug==='resume-evaluator'} />}</ProjectCard></Reveal>}))} />
  </div>;
}
