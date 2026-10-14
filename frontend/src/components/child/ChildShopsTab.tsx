import { Store } from 'lucide-react';
import { ChildProductDto, ChildProfileResponse, StoreDto } from '../../api/types';
import StoreView from '../StoreView';
import { EmptyState, Spinner } from '../ui';

interface Props {
  stores: StoreDto[];
  products: ChildProductDto[];
  profile: ChildProfileResponse | null;
  loading: boolean;
  onPurchased: () => void;
}

export default function ChildShopsTab({ stores, products, profile, loading, onPurchased }: Props) {
  if (loading) return <Spinner label="Открываем магазины…" />;

  if (stores.length === 0) {
    return (
      <EmptyState
        title="Магазины пока закрыты"
        hint="Загляни позже!"
        icon={<Store size={40} />}
      />
    );
  }

  const balanceFor = (storeId: number) =>
    profile?.balances.find((b) => b.storeId === storeId)?.amount;

  return (
    <div className="space-y-8">
      {stores.map((store) => (
        <StoreView
          key={store.id}
          store={store}
          products={products.filter((p) => p.storeId === store.id)}
          balance={balanceFor(store.id)}
          onPurchased={onPurchased}
        />
      ))}
    </div>
  );
}
