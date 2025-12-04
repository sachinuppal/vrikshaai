-- Allow users to delete their own draft applications
CREATE POLICY "Users can delete their own draft applications" 
ON public.accelerator_applications 
FOR DELETE 
USING (auth.uid() = user_id AND status = 'draft');