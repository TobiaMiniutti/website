import { ConsentManager } from "./components/ConsentManager";
import { Footer } from "./components/Footer";
import { Navigation } from "./components/Navigation";
import { getProject } from "./data/projects";
import { normalizePath } from "./lib/routes";
import { HomePage } from "./pages/HomePage";
import { PreferencesPage } from "./pages/PreferencesPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ConfirmationPage, NotFoundPage } from "./pages/StatusPages";

export function App({ url }: { url: string }) {
  const path = normalizePath(url);
  const projectMatch = path.match(/^\/progetti\/([^/]+)\/$/);
  const project = projectMatch ? getProject(projectMatch[1]) : undefined;
  let page: React.ReactNode;
  if (path === "/") page = <HomePage />;
  else if (path === "/progetti/") page = <ProjectsPage />;
  else if (project) page = <ProjectDetailPage project={project} />;
  else if (path === "/privacy/") page = <PrivacyPage />;
  else if (path === "/preferenze-cookie/") page = <PreferencesPage />;
  else if (path === "/conferma-invio/") page = <ConfirmationPage />;
  else page = <NotFoundPage />;

  return <ConsentManager suppressBanner={path === "/preferenze-cookie/"}><a className="skip-link" href="#contenuto">Vai al contenuto</a><Navigation path={path} />{page}<Footer /></ConsentManager>;
}
