import { Link } from 'react-router-dom';
import { EmptyState } from '../components/ui/PageHeader';

export function NotFound() {
  return (
    <EmptyState title="Halaman tidak dijumpai" action={<Link className="btn btn--primary" to="/">Ke Papan Pemuka</Link>}>
      Pautan ini mungkin salah atau halaman telah dipindahkan.
    </EmptyState>
  );
}
