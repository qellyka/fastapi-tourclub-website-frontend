import EditForm from './EditForm';
import { notFound } from 'next/navigation';

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) {
    notFound();
  }

  return <EditForm id={id} />;
}