-- All public-table access is server mediated. Remove legacy browser policies
-- so a future schema change cannot accidentally reopen customer or driver data.
do $$
declare
  policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = any (array[
        'users', 'buyer_profiles', 'driver_profiles', 'driver_documents',
        'vehicles', 'service_zones', 'towns', 'zone_towns', 'pricing_rules',
        'pickup_contacts', 'delivery_addresses', 'quotes', 'bookings',
        'booking_items', 'photos', 'status_events', 'payments', 'refunds',
        'payouts', 'disputes', 'ratings', 'messages', 'admin_notes',
        'audit_events', 'prohibited_item_reports', 'shopping_orders'
      ])
  loop
    execute format('drop policy if exists %I on %I.%I', policy_record.policyname, policy_record.schemaname, policy_record.tablename);
  end loop;
end $$;
