// Pydantic schema interfaces matching the backend RFQ schema
export interface PydanticPart {
  part_number: string | null;
  alt_part_number: string | null;
  serial_number: string | null;
  description: string | null;
  condition_code: string | null;
  certifications: string[] | null;
  trace_to: string | null;
  tag_type: string | null;
  tagged_by: string | null;
  tagged_date: string | null;
}

export interface PydanticVendor {
  name: string | null;
  address: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
}
