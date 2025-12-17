-- Add customer to the user_role enum
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'customer';

-- Create pitch_decks table for founders
CREATE TABLE public.pitch_decks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slides JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pitch_videos table for founders
CREATE TABLE public.pitch_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  video_url TEXT,
  thumbnail_url TEXT,
  script TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversations table for chat
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversation_participants table
CREATE TABLE public.conversation_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table for startups
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table for customers
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id),
  startup_id UUID NOT NULL REFERENCES public.startups(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hiring_requests table for connections between users
CREATE TABLE public.hiring_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL,
  target_id UUID NOT NULL,
  startup_id UUID REFERENCES public.startups(id),
  type TEXT NOT NULL CHECK (type IN ('developer', 'investor', 'mentor')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.pitch_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitch_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hiring_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for pitch_decks (founders only via startup ownership)
CREATE POLICY "Founders can manage own pitch decks" ON public.pitch_decks
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.startups WHERE id = pitch_decks.startup_id AND founder_id = auth.uid())
);

CREATE POLICY "Anyone can view pitch decks" ON public.pitch_decks
FOR SELECT USING (true);

-- RLS policies for pitch_videos (founders only via startup ownership)
CREATE POLICY "Founders can manage own pitch videos" ON public.pitch_videos
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.startups WHERE id = pitch_videos.startup_id AND founder_id = auth.uid())
);

CREATE POLICY "Anyone can view pitch videos" ON public.pitch_videos
FOR SELECT USING (true);

-- RLS policies for conversations (participants only)
CREATE POLICY "Participants can view conversations" ON public.conversations
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = conversations.id AND user_id = auth.uid())
);

CREATE POLICY "Authenticated users can create conversations" ON public.conversations
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS policies for conversation_participants
CREATE POLICY "Participants can view participants" ON public.conversation_participants
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = conversation_participants.conversation_id AND cp.user_id = auth.uid())
);

CREATE POLICY "Authenticated users can add participants" ON public.conversation_participants
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS policies for messages
CREATE POLICY "Participants can view messages" ON public.messages
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
);

CREATE POLICY "Participants can send messages" ON public.messages
FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
);

-- RLS policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON public.notifications
FOR INSERT WITH CHECK (true);

-- RLS policies for products
CREATE POLICY "Anyone can view active products" ON public.products
FOR SELECT USING (active = true);

CREATE POLICY "Founders can manage own products" ON public.products
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.startups WHERE id = products.startup_id AND founder_id = auth.uid())
);

-- RLS policies for orders
CREATE POLICY "Customers can view own orders" ON public.orders
FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Founders can view startup orders" ON public.orders
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.startups WHERE id = orders.startup_id AND founder_id = auth.uid())
);

CREATE POLICY "Customers can create orders" ON public.orders
FOR INSERT WITH CHECK (customer_id = auth.uid());

-- RLS policies for hiring_requests
CREATE POLICY "Users can view own hiring requests" ON public.hiring_requests
FOR SELECT USING (requester_id = auth.uid() OR target_id = auth.uid());

CREATE POLICY "Users can create hiring requests" ON public.hiring_requests
FOR INSERT WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Target users can update hiring requests" ON public.hiring_requests
FOR UPDATE USING (target_id = auth.uid());

-- Enable realtime for messages and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create triggers for updated_at
CREATE TRIGGER update_pitch_decks_updated_at BEFORE UPDATE ON public.pitch_decks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pitch_videos_updated_at BEFORE UPDATE ON public.pitch_videos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hiring_requests_updated_at BEFORE UPDATE ON public.hiring_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();