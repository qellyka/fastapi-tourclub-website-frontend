'use client';

import EditNewsForm from './EditNewsForm';
import { use } from 'react';

export default function EditNewsPage({ params }: { params: { id: string } }) {
  const { id } = use(params);

  return <EditNewsForm id={id} />;
}