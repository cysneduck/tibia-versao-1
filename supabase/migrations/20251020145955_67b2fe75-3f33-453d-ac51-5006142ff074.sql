-- Create enums for ticket system
CREATE TYPE ticket_category AS ENUM ('bug', 'suggestion', 'ks_report', 'other');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Create tickets table
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category ticket_category NOT NULL,
  status ticket_status NOT NULL DEFAULT 'open',
  priority ticket_priority NOT NULL DEFAULT 'medium',
  screenshot_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  admin_notes TEXT
);

-- Enable RLS on tickets
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Users can view their own tickets
CREATE POLICY "Users can view their own tickets"
  ON public.tickets
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can create their own tickets
CREATE POLICY "Users can create their own tickets"
  ON public.tickets
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets"
  ON public.tickets
  FOR SELECT
  USING (is_admin_or_master(auth.uid()));

-- Admins can update all tickets
CREATE POLICY "Admins can update all tickets"
  ON public.tickets
  FOR UPDATE
  USING (is_admin_or_master(auth.uid()));

-- Create storage bucket for ticket screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('ticket-screenshots', 'ticket-screenshots', true);

-- Storage policies for ticket screenshots
CREATE POLICY "Users can upload their own ticket screenshots"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'ticket-screenshots' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own ticket screenshots"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'ticket-screenshots' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can view all ticket screenshots"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'ticket-screenshots' 
    AND is_admin_or_master(auth.uid())
  );

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create index for faster ticket queries
CREATE INDEX idx_tickets_user_id ON public.tickets(user_id);
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_tickets_category ON public.tickets(category);
CREATE INDEX idx_tickets_created_at ON public.tickets(created_at DESC);