import ProjectRow from './ProjectRow';

export default function ProjectsTable({ projects, recent }) {

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse">
                <thead className="hidden md:table-header-group">
                    <tr className="text-sm text-left border-b text-muted-foreground border-white/10">
                        <th className="px-4 py-3">Actions</th>
                        <th className="px-4 py-3">Project name</th>
                        <th className="px-4 py-3">Sources</th>
                        <th className="px-4 py-3">{recent ? "Updated" : "Created"}</th>
                    </tr>
                </thead>

                <tbody>
                    {projects.map((item) => (
                        <ProjectRow key={item.project_id} project={item} recent={recent} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
