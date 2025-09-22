import ApplicationDetailClientPage from "./ApplicationDetailClientPage";

interface Props {
    params: {
        id: string;
    }
}

export default function ApplicationDetailPage({ params }: Props) {
    const applicationId = Number(params.id);

    return <ApplicationDetailClientPage id={applicationId} />;
}