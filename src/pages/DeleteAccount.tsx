import LegalPage from '../components/LegalPage';
import { deleteAccountMeta, deleteAccountSections } from '../content/deleteAccount';

export default function DeleteAccount() {
  return (
    <LegalPage
      title={deleteAccountMeta.title}
      updated={deleteAccountMeta.updated}
      sections={deleteAccountSections}
    >
      <p className="legal-cta">
        <a href="mailto:useslumber@gmail.com?subject=Delete%20my%20Slumber%20account">
          Email useslumber@gmail.com to request deletion
        </a>
      </p>
    </LegalPage>
  );
}
