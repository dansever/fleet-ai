from typing import Optional
import datetime
import decimal
import uuid

from sqlalchemy import ARRAY, Boolean, Date, DateTime, Enum, ForeignKeyConstraint, Index, Integer, Numeric, PrimaryKeyConstraint, Text, UniqueConstraint, Uuid, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass


class Organizations(Base):
    __tablename__ = 'organizations'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='organizations_pkey'),
        UniqueConstraint('clerk_org_id', name='organizations_clerk_org_id_unique')
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, server_default=text('gen_random_uuid()'))
    clerk_org_id: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(True), nullable=False, server_default=text('now()'))
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(True), nullable=False, server_default=text('now()'))
    name: Mapped[Optional[str]] = mapped_column(Text)
    ai_tokens_used: Mapped[Optional[int]] = mapped_column(Integer, server_default=text('0'))
    total_quotes_processed: Mapped[Optional[int]] = mapped_column(Integer, server_default=text('0'))
    total_rfqs_processed: Mapped[Optional[int]] = mapped_column(Integer, server_default=text('0'))

    airports: Mapped[list['Airports']] = relationship('Airports', back_populates='org')
    users: Mapped[list['Users']] = relationship('Users', back_populates='org')
    vendors: Mapped[list['Vendors']] = relationship('Vendors', back_populates='org')
    contacts: Mapped[list['Contacts']] = relationship('Contacts', back_populates='org')
    fuel_contracts: Mapped[list['FuelContracts']] = relationship('FuelContracts', back_populates='org')
    fuel_tenders: Mapped[list['FuelTenders']] = relationship('FuelTenders', back_populates='org')
    rfqs: Mapped[list['Rfqs']] = relationship('Rfqs', back_populates='org')
    service_contracts: Mapped[list['ServiceContracts']] = relationship('ServiceContracts', back_populates='org')
    quotes: Mapped[list['Quotes']] = relationship('Quotes', back_populates='org')


class Airports(Base):
    __tablename__ = 'airports'
    __table_args__ = (
        ForeignKeyConstraint(['org_id'], ['organizations.id'], ondelete='CASCADE', name='fk_airports_org_id'),
        PrimaryKeyConstraint('id', name='airports_pkey')
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, server_default=text('gen_random_uuid()'))
    org_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    country: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(True), nullable=False, server_default=text('now()'))
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(True), nullable=False, server_default=text('now()'))
    iata: Mapped[Optional[str]] = mapped_column(Text)
    icao: Mapped[Optional[str]] = mapped_column(Text)
    city: Mapped[Optional[str]] = mapped_column(Text)
    state: Mapped[Optional[str]] = mapped_column(Text)
    is_hub: Mapped[Optional[bool]] = mapped_column(Boolean, server_default=text('false'))
    internal_notes: Mapped[Optional[str]] = mapped_column(Text)

    org: Mapped['Organizations'] = relationship('Organizations', back_populates='airports')
    fuel_contracts: Mapped[list['FuelContracts']] = relationship('FuelContracts', back_populates='airport')
    fuel_tenders: Mapped[list['FuelTenders']] = relationship('FuelTenders', back_populates='airport')
    service_contracts: Mapped[list['ServiceContracts']] = relationship('ServiceContracts', back_populates='airport')


class OrgSettings(Organizations):
    __tablename__ = 'org_settings'
    __table_args__ = (
        ForeignKeyConstraint(['org_id'], ['organizations.id'], ondelete='CASCADE', name='fk_org_settings_org_id'),
        PrimaryKeyConstraint('org_id', name='org_settings_pkey')
    )

    org_id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(True), nullable=False, server_default=text('now()'))
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(True), nullable=False, server_default=text('now()'))
    auto_approval_limit: Mapped[Optional[int]] = mapped_column(Integer, server_default=text('10000'))
    ai_insights_enabled: Mapped[Optional[bool]] = mapped_column(Boolean, server_default=text('true'))
    agents_enabled: Mapped[Optional[bool]] = mapped_column(Boolean, server_default=text('true'))


class Users(Base):
    __tablename__ = 'users'
    __table_args__ = (
        ForeignKeyConstraint(['org_id'], ['organizations.id'], ondelete='CASCADE', name='fk_users_org_id'),
        PrimaryKeyConstraint('id', name='users_pkey'),
        UniqueConstraint('clerk_user_id', name='users_clerk_user_id_unique')
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, server_default=text('gen_random_uuid()'))
    clerk_user_id: Mapped[str] = mapped_column(Text, nullable=False)
    org_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False)
    display_name: Mapped[str] = mapped_column(Text, nullable=False)
    email: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(True), nullable=False, server_default=text('now()'))
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(True), nullable=False, server_default=text('now()'))
    position: Mapped[Optional[str]] = mapped_column(Text)
    ai_tokens_used: Mapped[Optional[int]] = mapped_column(Integer, server_default=text('0'))
    total_quotes_processed: Mapped[Optional[int]] = mapped_column(Integer, server_default=text('0'))
    total_rfqs_processed: Mapped[Optional[int]] = mapped_column(Integer, server_default=text('0'))
    last_seen_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(True))

    org: Mapped['Organizations'] = relationship('Organizations', back_populates='users')
    rfqs: Mapped[list['Rfqs']] = relationship('Rfqs', back_populates='user')
    fuel_bids: Mapped[list['FuelBids']] = relationship('FuelBids', back_populates='decision_by_user')


class Vendors(Base):
    __tablename__ = 'vendors'
    __table_args__ = (
        ForeignKeyConstraint(['org_id'], ['organizations.id'], ondelete='CASCADE', name='fk_vendors_org_id'),
        PrimaryKeyConstraint('id', name='vendors_pkey')
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, server_default=text('gen_random_uuid()'))
    org_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(True), nullable=False, server_default=text('now()'))
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(True), nullable=False, server_default=text('now()'))
    internal_rating: Mapped[Optional[int]] = mapped_column(Integer)
    notes: Mapped[Optional[str]] = mapped_column(Text)

    org: Mapped['Organizations'] = relationship('Organizations', back_populates='vendors')
    contacts: Mapped[list['Contacts']] = relationship('Contacts', back_populates='vendor')


class Contacts(Base):
    __tablename__ = 'contacts'
    __table_args__ = (
        ForeignKeyConstraint(['org_id'], ['organizations.id'], ondelete='CASCADE', name='fk_contacts_org_id'),
        ForeignKeyConstraint(['vendor_id'], ['vendors.id'], ondelete='CASCADE', name='fk_contacts_vendor_id'),
        PrimaryKeyConstraint('id', name='contacts_pkey')
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, server_default=text('gen_random_uuid()'))
    org_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(True), nullable=False, server_default=text('now()'))
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(True), nullable=False, server_default=text('now()'))
    vendor_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid)
    name: Mapped[Optional[str]] = mapped_column(Text)
    email: Mapped[Optional[str]] = mapped_column(Text)
    phone: Mapped[Optional[str]] = mapped_column(Text)
    role: Mapped[Optional[str]] = mapped_column(Text)
    department: Mapped[Optional[str]] = mapped_column(Text)

    org: Mapped['Organizations'] = relationship('Organizations', back_populates='contacts')
    vendor: Mapped[Optional['Vendors']] = relationship('Vendors', back_populates='contacts')


class FuelContracts(Base):
    __tablename__ = 'fuel_contracts'
    __table_args__ = (
        ForeignKeyConstraint(['airport_id'], ['airports.id'], ondelete='CASCADE', name='fk_fuel_contracts_airport_id'),
        ForeignKeyConstraint(['org_id'], ['organizations.id'], ondelete='CASCADE', name='fk_fuel_contracts_org_id'),
        PrimaryKeyConstraint('id', name='fuel_contracts_pkey'),
        Index('uq_org_airport_type_fuel_contract', 'org_id', 'airport_id', 'fuel_type', unique=True)
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, server_default=text('gen_random_uuid()'))
    org_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False)
    airport_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(True), nullable=False, server_default=text('now()'))
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(True), nullable=False, server_default=text('now()'))
    contract_number: Mapped[Optional[str]] = mapped_column(Text)
    title: Mapped[Optional[str]] = mapped_column(Text)
    fuel_type: Mapped[Optional[str]] = mapped_column(Text)
    vendor_name: Mapped[Optional[str]] = mapped_column(Text)
    vendor_address: Mapped[Optional[str]] = mapped_column(Text)
    vendor_contact_name: Mapped[Optional[str]] = mapped_column(Text)
    vendor_contact_email: Mapped[Optional[str]] = mapped_column(Text)
    vendor_contact_phone: Mapped[Optional[str]] = mapped_column(Text)
    currency: Mapped[Optional[str]] = mapped_column(Text)
    price_type: Mapped[Optional[str]] = mapped_column(Text)
    price_formula: Mapped[Optional[str]] = mapped_column(Text)
    base_unit_price: Mapped[Optional[decimal.Decimal]] = mapped_column(Numeric)
    normalized_usd_per_usg: Mapped[Optional[decimal.Decimal]] = mapped_column(Numeric)
    volume_committed: Mapped[Optional[decimal.Decimal]] = mapped_column(Numeric)
    volume_unit: Mapped[Optional[str]] = mapped_column(Text)
    into_plane_fee: Mapped[Optional[decimal.Decimal]] = mapped_column(Numeric)
    includes_taxes: Mapped[Optional[bool]] = mapped_column(Boolean)
    includes_airport_fees: Mapped[Optional[bool]] = mapped_column(Boolean)
    effective_from: Mapped[Optional[datetime.date]] = mapped_column(Date)
    effective_to: Mapped[Optional[datetime.date]] = mapped_column(Date)
    pdf_url: Mapped[Optional[str]] = mapped_column(Text)
    raw_text: Mapped[Optional[str]] = mapped_column(Text)
    ai_summary: Mapped[Optional[str]] = mapped_column(Text)
    terms: Mapped[Optional[dict]] = mapped_column(JSONB, server_default=text("'{}'::jsonb"))
    status: Mapped[Optional[str]] = mapped_column(Enum('draft', 'pending', 'in_progress', 'completed', 'rejected', 'closed', name='status'), server_default=text("'pending'::status"))

    airport: Mapped['Airports'] = relationship('Airports', back_populates='fuel_contracts')
    org: Mapped['Organizations'] = relationship('Organizations', back_populates='fuel_contracts')
    fuel_contract_invoices: Mapped[list['FuelContractInvoices']] = relationship('FuelContractInvoices', back_populates='fuel_contract')


class FuelTenders(Base):
    __tablename__ = 'fuel_tenders'
    __table_args__ = (
        ForeignKeyConstraint(['airport_id'], ['airports.id'], ondelete='CASCADE', name='fk_fuel_tenders_airport_id'),
        ForeignKeyConstraint(['org_id'], ['organizations.id'], ondelete='CASCADE', name='fk_fuel_tenders_org_id'),
        PrimaryKeyConstraint('id', name='fuel_tenders_pkey')
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, server_default=text('gen_random_uuid()'))
    org_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False)
    airport_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(True), nullable=False, server_default=text('now()'))
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(True), nullable=False, server_default=text('now()'))
    description: Mapped[Optional[str]] = mapped_column(Text)
    fuel_type: Mapped[Optional[str]] = mapped_column(Text)
    base_currency: Mapped[Optional[str]] = mapped_column(Text)
    base_uom: Mapped[Optional[str]] = mapped_column(Text)
    bidding_starts: Mapped[Optional[datetime.date]] = mapped_column(Date)
    bidding_ends: Mapped[Optional[datetime.date]] = mapped_column(Date)
    delivery_starts: Mapped[Optional[datetime.date]] = mapped_column(Date)
    delivery_ends: Mapped[Optional[datetime.date]] = mapped_column(Date)
    status: Mapped[Optional[str]] = mapped_column(Enum('draft', 'pending', 'in_progress', 'completed', 'rejected', 'closed', name='status'), server_default=text("'pending'::status"))
    winning_bid_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid)

    airport: Mapped['Airports'] = relationship('Airports', back_populates='fuel_tenders')
    org: Mapped['Organizations'] = relationship('Organizations', back_populates='fuel_tenders')
    fuel_bids: Mapped[list['FuelBids']] = relationship('FuelBids', back_populates='tender')


class Rfqs(Base):
    __tablename__ = 'rfqs'
    __table_args__ = (
        ForeignKeyConstraint(['org_id'], ['organizations.id'], ondelete='CASCADE', name='fk_rfqs_org_id'),
        ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE', name='fk_rfqs_user_id'),
        PrimaryKeyConstraint('id', name='rfqs_pkey'),
        Index('uq_org_rfq_number', 'rfq_number', 'org_id', unique=True)
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, server_default=text('gen_random_uuid()'))
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False)
    org_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(True), nullable=False, server_default=text('now()'))
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(True), nullable=False, server_default=text('now()'))
    direction: Mapped[Optional[str]] = mapped_column(Enum('sent', 'received', name='order_direction'))
    rfq_number: Mapped[Optional[str]] = mapped_column(Text)
    vendor_name: Mapped[Optional[str]] = mapped_column(Text)
    vendor_address: Mapped[Optional[str]] = mapped_column(Text)
    vendor_contact_name: Mapped[Optional[str]] = mapped_column(Text)
    vendor_contact_email: Mapped[Optional[str]] = mapped_column(Text)
    vendor_contact_phone: Mapped[Optional[str]] = mapped_column(Text)
    part_number: Mapped[Optional[str]] = mapped_column(Text)
    alt_part_number: Mapped[Optional[str]] = mapped_column(Text)
    part_description: Mapped[Optional[str]] = mapped_column(Text)
    condition_code: Mapped[Optional[str]] = mapped_column(Text)
    unit_of_measure: Mapped[Optional[str]] = mapped_column(Text)
    quantity: Mapped[Optional[int]] = mapped_column(Integer)
    pricing_type: Mapped[Optional[str]] = mapped_column(Text)
    urgency_level: Mapped[Optional[str]] = mapped_column(Text)
    deliver_to: Mapped[Optional[str]] = mapped_column(Text)
    buyer_comments: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[Optional[str]] = mapped_column(Enum('draft', 'pending', 'in_progress', 'completed', 'rejected', 'closed', name='status'), server_default=text("'pending'::status"))
    status_history: Mapped[Optional[dict]] = mapped_column(JSONB, server_default=text("'[]'::jsonb"))
    selected_quote_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid)
    sent_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(True))

    org: Mapped['Organizations'] = relationship('Organizations', back_populates='rfqs')
    user: Mapped['Users'] = relationship('Users', back_populates='rfqs')
    quotes: Mapped[list['Quotes']] = relationship('Quotes', back_populates='rfq')


class ServiceContracts(Base):
    __tablename__ = 'service_contracts'
    __table_args__ = (
        ForeignKeyConstraint(['airport_id'], ['airports.id'], ondelete='CASCADE', name='fk_service_contracts_airport_id'),
        ForeignKeyConstraint(['org_id'], ['organizations.id'], ondelete='CASCADE', name='fk_service_contracts_org_id'),
        PrimaryKeyConstraint('id', name='service_contracts_pkey'),
        Index('uq_org_airport_vendor_contract', 'title', 'org_id', 'airport_id', unique=True)
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, server_default=text('gen_random_uuid()'))
    org_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(True), nullable=False, server_default=text('now()'))
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(True), nullable=False, server_default=text('now()'))
    airport_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid)
    notes: Mapped[Optional[str]] = mapped_column(Text)
    vendor_name: Mapped[Optional[str]] = mapped_column(Text)
    vendor_address: Mapped[Optional[str]] = mapped_column(Text)
    vendor_contact_name: Mapped[Optional[str]] = mapped_column(Text)
    vendor_contact_email: Mapped[Optional[str]] = mapped_column(Text)
    vendor_contact_phone: Mapped[Optional[str]] = mapped_column(Text)
    effective_from: Mapped[Optional[datetime.date]] = mapped_column(Date)
    effective_to: Mapped[Optional[datetime.date]] = mapped_column(Date)
    pdf_url: Mapped[Optional[str]] = mapped_column(Text)
    raw_text: Mapped[Optional[str]] = mapped_column(Text)
    ai_summary: Mapped[Optional[str]] = mapped_column(Text)
    terms: Mapped[Optional[dict]] = mapped_column(JSONB, server_default=text("'{}'::jsonb"))
    contract_type: Mapped[Optional[str]] = mapped_column(Enum('fuel_and_ground_ops', 'catering_and_onboard_services', 'technical_and_infrastructure', 'airport_services', 'commercial_services', 'security_and_compliance', 'other', name='contract_type'))

    airport: Mapped[Optional['Airports']] = relationship('Airports', back_populates='service_contracts')
    org: Mapped['Organizations'] = relationship('Organizations', back_populates='service_contracts')
    service_contract_invoices: Mapped[list['ServiceContractInvoices']] = relationship('ServiceContractInvoices', back_populates='service_contract')


class FuelBids(Base):
    __tablename__ = 'fuel_bids'
    __table_args__ = (
        ForeignKeyConstraint(['decision_by_user_id'], ['users.id'], ondelete='SET NULL', name='fk_fuel_bids_decision_by_user_id'),
        ForeignKeyConstraint(['tender_id'], ['fuel_tenders.id'], ondelete='CASCADE', name='fk_fuel_bids_tender_id'),
        PrimaryKeyConstraint('id', name='fuel_bids_pkey')
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, server_default=text('gen_random_uuid()'))
    tender_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(True), nullable=False, server_default=text('now()'))
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(True), nullable=False, server_default=text('now()'))
    title: Mapped[Optional[str]] = mapped_column(Text)
    round: Mapped[Optional[int]] = mapped_column(Integer)
    bid_submitted_at: Mapped[Optional[datetime.date]] = mapped_column(Date)
    vendor_name: Mapped[Optional[str]] = mapped_column(Text)
    vendor_address: Mapped[Optional[str]] = mapped_column(Text)
    vendor_contact_name: Mapped[Optional[str]] = mapped_column(Text)
    vendor_contact_email: Mapped[Optional[str]] = mapped_column(Text)
    vendor_contact_phone: Mapped[Optional[str]] = mapped_column(Text)
    vendor_comments: Mapped[Optional[str]] = mapped_column(Text)
    price_type: Mapped[Optional[str]] = mapped_column(Text)
    uom: Mapped[Optional[str]] = mapped_column(Text, server_default=text("'USG'::text"))
    currency: Mapped[Optional[str]] = mapped_column(Text, server_default=text("'USD'::text"))
    payment_terms: Mapped[Optional[str]] = mapped_column(Text)
    base_unit_price: Mapped[Optional[decimal.Decimal]] = mapped_column(Numeric)
    index_name: Mapped[Optional[str]] = mapped_column(Text)
    index_location: Mapped[Optional[str]] = mapped_column(Text)
    differential: Mapped[Optional[decimal.Decimal]] = mapped_column(Numeric)
    differential_unit: Mapped[Optional[str]] = mapped_column(Text)
    formula_notes: Mapped[Optional[str]] = mapped_column(Text)
    into_plane_fee: Mapped[Optional[decimal.Decimal]] = mapped_column(Numeric)
    handling_fee: Mapped[Optional[decimal.Decimal]] = mapped_column(Numeric)
    other_fee: Mapped[Optional[decimal.Decimal]] = mapped_column(Numeric)
    other_fee_description: Mapped[Optional[str]] = mapped_column(Text)
    includes_taxes: Mapped[Optional[bool]] = mapped_column(Boolean)
    includes_airport_fees: Mapped[Optional[bool]] = mapped_column(Boolean)
    density_at_15c: Mapped[Optional[decimal.Decimal]] = mapped_column(Numeric)
    norm_usd_per_usg: Mapped[Optional[decimal.Decimal]] = mapped_column(Numeric)
    ai_summary: Mapped[Optional[str]] = mapped_column(Text)
    decision: Mapped[Optional[str]] = mapped_column(Enum('undecided', 'accepted', 'rejected', 'shortlisted', name='decision'))
    decision_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid)
    decision_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(True))
    decision_notes: Mapped[Optional[str]] = mapped_column(Text)

    decision_by_user: Mapped[Optional['Users']] = relationship('Users', back_populates='fuel_bids')
    tender: Mapped['FuelTenders'] = relationship('FuelTenders', back_populates='fuel_bids')


class FuelContractInvoices(Base):
    __tablename__ = 'fuel_contract_invoices'
    __table_args__ = (
        ForeignKeyConstraint(['fuel_contract_id'], ['fuel_contracts.id'], ondelete='CASCADE', name='fk_fuel_contract_invoices_fuel_contract_id'),
        PrimaryKeyConstraint('id', name='fuel_contract_invoices_pkey')
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, server_default=text('gen_random_uuid()'))
    org_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False)
    invoice_number: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(True), nullable=False, server_default=text('now()'))
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(True), nullable=False, server_default=text('now()'))
    fuel_contract_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid)
    invoice_date: Mapped[Optional[datetime.date]] = mapped_column(Date)
    vendor_name: Mapped[Optional[str]] = mapped_column(Text)
    vendor_address: Mapped[Optional[str]] = mapped_column(Text)
    vendor_contact_name: Mapped[Optional[str]] = mapped_column(Text)
    vendor_contact_email: Mapped[Optional[str]] = mapped_column(Text)
    vendor_contact_phone: Mapped[Optional[str]] = mapped_column(Text)
    total_amount: Mapped[Optional[decimal.Decimal]] = mapped_column(Numeric)
    currency: Mapped[Optional[str]] = mapped_column(Text)
    lines: Mapped[Optional[dict]] = mapped_column(JSONB, server_default=text("'[]'::jsonb"))

    fuel_contract: Mapped[Optional['FuelContracts']] = relationship('FuelContracts', back_populates='fuel_contract_invoices')


class Quotes(Base):
    __tablename__ = 'quotes'
    __table_args__ = (
        ForeignKeyConstraint(['org_id'], ['organizations.id'], ondelete='CASCADE', name='fk_quotes_org_id'),
        ForeignKeyConstraint(['rfq_id'], ['rfqs.id'], ondelete='CASCADE', name='fk_quotes_rfq_id'),
        PrimaryKeyConstraint('id', name='quotes_pkey')
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, server_default=text('gen_random_uuid()'))
    rfq_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(True), nullable=False, server_default=text('now()'))
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(True), nullable=False, server_default=text('now()'))
    org_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False)
    rfq_number: Mapped[Optional[str]] = mapped_column(Text)
    direction: Mapped[Optional[str]] = mapped_column(Enum('sent', 'received', name='order_direction'))
    vendor_name: Mapped[Optional[str]] = mapped_column(Text)
    vendor_address: Mapped[Optional[str]] = mapped_column(Text)
    vendor_contact_name: Mapped[Optional[str]] = mapped_column(Text)
    vendor_contact_email: Mapped[Optional[str]] = mapped_column(Text)
    vendor_contact_phone: Mapped[Optional[str]] = mapped_column(Text)
    part_number: Mapped[Optional[str]] = mapped_column(Text)
    serial_number: Mapped[Optional[str]] = mapped_column(Text)
    part_description: Mapped[Optional[str]] = mapped_column(Text)
    condition_code: Mapped[Optional[str]] = mapped_column(Text)
    unit_of_measure: Mapped[Optional[str]] = mapped_column(Text)
    quantity: Mapped[Optional[int]] = mapped_column(Integer)
    price: Mapped[Optional[decimal.Decimal]] = mapped_column(Numeric)
    currency: Mapped[Optional[str]] = mapped_column(Text)
    pricing_type: Mapped[Optional[str]] = mapped_column(Text)
    pricing_method: Mapped[Optional[str]] = mapped_column(Text)
    core_due: Mapped[Optional[str]] = mapped_column(Text)
    core_change: Mapped[Optional[str]] = mapped_column(Text)
    payment_terms: Mapped[Optional[str]] = mapped_column(Text)
    minimum_order_quantity: Mapped[Optional[int]] = mapped_column(Integer)
    lead_time: Mapped[Optional[str]] = mapped_column(Text)
    delivery_terms: Mapped[Optional[str]] = mapped_column(Text)
    warranty: Mapped[Optional[str]] = mapped_column(Text)
    quote_expiration_date: Mapped[Optional[str]] = mapped_column(Text)
    certifications: Mapped[Optional[list[str]]] = mapped_column(ARRAY(Text()), server_default=text("'{}'::text[]"))
    trace_to: Mapped[Optional[str]] = mapped_column(Text)
    tag_type: Mapped[Optional[str]] = mapped_column(Text)
    tagged_by: Mapped[Optional[str]] = mapped_column(Text)
    tagged_date: Mapped[Optional[str]] = mapped_column(Text)
    vendor_comments: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[Optional[str]] = mapped_column(Enum('draft', 'pending', 'in_progress', 'completed', 'rejected', 'closed', name='status'), server_default=text("'pending'::status"))
    sent_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(True))

    org: Mapped['Organizations'] = relationship('Organizations', back_populates='quotes')
    rfq: Mapped['Rfqs'] = relationship('Rfqs', back_populates='quotes')


class ServiceContractInvoices(Base):
    __tablename__ = 'service_contract_invoices'
    __table_args__ = (
        ForeignKeyConstraint(['service_contract_id'], ['service_contracts.id'], ondelete='CASCADE', name='fk_service_contract_invoices_service_contract_id'),
        PrimaryKeyConstraint('id', name='service_contract_invoices_pkey'),
        Index('uq_org_invoice_number', 'invoice_number', 'org_id', unique=True)
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, server_default=text('gen_random_uuid()'))
    org_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False)
    invoice_number: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(True), nullable=False, server_default=text('now()'))
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(True), nullable=False, server_default=text('now()'))
    service_contract_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid)
    invoice_date: Mapped[Optional[datetime.date]] = mapped_column(Date)
    vendor_name: Mapped[Optional[str]] = mapped_column(Text)
    vendor_address: Mapped[Optional[str]] = mapped_column(Text)
    vendor_contact_name: Mapped[Optional[str]] = mapped_column(Text)
    vendor_contact_email: Mapped[Optional[str]] = mapped_column(Text)
    vendor_contact_phone: Mapped[Optional[str]] = mapped_column(Text)
    total_amount: Mapped[Optional[decimal.Decimal]] = mapped_column(Numeric)
    currency: Mapped[Optional[str]] = mapped_column(Text)
    lines: Mapped[Optional[dict]] = mapped_column(JSONB, server_default=text("'[]'::jsonb"))

    service_contract: Mapped[Optional['ServiceContracts']] = relationship('ServiceContracts', back_populates='service_contract_invoices')
