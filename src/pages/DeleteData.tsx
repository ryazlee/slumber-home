import LegalPage from '../components/LegalPage';
import { deleteDataMeta, deleteDataSections } from '../content/deleteData';

export default function DeleteData() {
  return (
    <LegalPage
      title={deleteDataMeta.title}
      updated={deleteDataMeta.updated}
      sections={deleteDataSections}
    >
      <p className="legal-cta">
        <a href="mailto:useslumber@gmail.com?subject=Delete%20my%20Slumber%20data">
          Email useslumber@gmail.com to request data deletion
        </a>
      </p>
    </LegalPage>
  );
}
