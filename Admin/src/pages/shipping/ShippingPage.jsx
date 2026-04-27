import CrudPage from '../../components/common/CrudPage';

const cityColumns = [
  { key: 'city_id', label: 'ID' },
  { key: 'city_name', label: 'City', render: (v) => <span className="font-medium">{v}</span> },
  { key: 'division', label: 'Division' },
  { key: 'postal_code', label: 'Postal Code' },
  { key: 'shipping_zone_id', label: 'Zone ID' },
  { key: 'is_active', label: 'Active', render: (v) => <span className={`badge-status ${v==='1'?'badge-active':'badge-inactive'}`}>{v==='1'?'Yes':'No'}</span> },
];

const cityFields = [
  { key: 'city_name', label: 'City Name' },
  { key: 'division', label: 'Division' },
  { key: 'postal_code', label: 'Postal Code' },
  { key: 'shipping_zone_id', label: 'Shipping Zone ID' },
  { key: 'is_active', label: 'Active', type: 'select', default: '1', options: [{ value: '1', label: 'Yes' }, { value: '0', label: 'No' }] },
];

const zoneColumns = [
  { key: 'zone_id', label: 'ID' },
  { key: 'zone_name', label: 'Zone', render: (v) => <span className="font-medium">{v}</span> },
  { key: 'standard_fee', label: 'Std Fee', render: (v) => `৳${v}` },
  { key: 'standard_min_days', label: 'Std Days', render: (v, row) => `${v}–${row.standard_max_days}` },
  { key: 'has_express', label: 'Express', render: (v) => v === '1' ? '✅' : '—' },
  { key: 'express_fee', label: 'Exp Fee', render: (v) => `৳${v}` },
  { key: 'is_active', label: 'Active', render: (v) => <span className={`badge-status ${v==='1'?'badge-active':'badge-inactive'}`}>{v==='1'?'Yes':'No'}</span> },
];

const zoneFields = [
  { key: 'zone_name', label: 'Zone Name' },
  { key: 'standard_fee', label: 'Standard Fee', default: '60' },
  { key: 'standard_min_days', label: 'Standard Min Days', default: '3' },
  { key: 'standard_max_days', label: 'Standard Max Days', default: '5' },
  { key: 'has_express', label: 'Has Express', type: 'select', default: '0', options: [{ value: '1', label: 'Yes' }, { value: '0', label: 'No' }] },
  { key: 'express_fee', label: 'Express Fee', default: '120' },
  { key: 'express_min_days', label: 'Express Min Days', default: '1' },
  { key: 'express_max_days', label: 'Express Max Days', default: '2' },
  { key: 'is_active', label: 'Active', type: 'select', default: '1', options: [{ value: '1', label: 'Yes' }, { value: '0', label: 'No' }] },
];

export default function ShippingPage() {
  return (
    <div className="space-y-8">
      <CrudPage title="Shipping Zones" subtitle="Manage delivery zones and fees" endpoint="/shipping-zones" idField="zone_id" columns={zoneColumns} formFields={zoneFields} />
      <CrudPage title="Cities" subtitle="Manage cities and their zone assignments" endpoint="/cities" idField="city_id" columns={cityColumns} formFields={cityFields} />
    </div>
  );
}
