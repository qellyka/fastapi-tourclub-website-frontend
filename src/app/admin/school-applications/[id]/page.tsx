import ApplicationDetailClientPage from "./ApplicationDetailClientPage";

interface Props {
    params: {
        id: string;
    }
}

export default function ApplicationDetailPage({ params }: Props) {
    const { id } = params;
    const applicationId = Number(id);

    return <ApplicationDetailClientPage id={applicationId} />;
}