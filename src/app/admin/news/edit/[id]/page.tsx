import EditNewsForm from './EditNewsForm';

export default async function EditNewsPage({ params }: { params: { id: string } }) {
  const { id } = params;

  return <EditNewsForm id={id} />;
}