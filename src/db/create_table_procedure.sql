-- Create a stored procedure to create the user_subscriptions table
CREATE OR REPLACE FUNCTION create_user_subscriptions_table()
RETURNS void AS $$
BEGIN
  -- Check if table already exists
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'user_subscriptions'
  ) THEN
    -- Create the table
    CREATE TABLE public.user_subscriptions (y
      id BIGSERIAL PRIMARY KEY,
      user_id UUID NOT NULL UNIQUE,
      plan VARCHAR(20) NOT NULL DEFAULT 'free',
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      stripe_customer_id VARCHAR(255),
      stripe_subscription_id VARCHAR(255),
      current_period_end BIGINT,
      last_updated BIGINT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    -- Add index on user_id for faster lookups
    CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
    
    -- Add index on stripe_customer_id for webhook processing
    CREATE INDEX idx_user_subscriptions_stripe_customer_id ON public.user_subscriptions(stripe_customer_id);
    
    -- Add a function to update the updated_at timestamp automatically if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM pg_proc 
      WHERE proname = 'trigger_set_timestamp'
    ) THEN
      EXECUTE '
        CREATE FUNCTION trigger_set_timestamp()
        RETURNS TRIGGER AS $trigger$
        BEGIN
          NEW.updated_at = NOW();
          NEW.last_updated = EXTRACT(EPOCH FROM NOW()) * 1000;
          RETURN NEW;
        END;
        $trigger$ LANGUAGE plpgsql;
      ';
    END IF;
    
    -- Create a trigger to set updated_at on update
    CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();
    
    RAISE NOTICE 'Created user_subscriptions table';
  ELSE
    -- Check if we need to add the last_updated column to an existing table
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'user_subscriptions' 
      AND column_name = 'last_updated'
    ) THEN
      ALTER TABLE public.user_subscriptions ADD COLUMN last_updated BIGINT;
      
      -- Update existing records with a current timestamp
      UPDATE public.user_subscriptions 
      SET last_updated = EXTRACT(EPOCH FROM NOW()) * 1000;
      
      -- Also update the trigger function to maintain the last_updated field
      EXECUTE '
        CREATE OR REPLACE FUNCTION trigger_set_timestamp()
        RETURNS TRIGGER AS $trigger$
        BEGIN
          NEW.updated_at = NOW();
          NEW.last_updated = EXTRACT(EPOCH FROM NOW()) * 1000;
          RETURN NEW;
        END;
        $trigger$ LANGUAGE plpgsql;
      ';
      
      RAISE NOTICE 'Added last_updated column to user_subscriptions table';
    ELSE
      RAISE NOTICE 'user_subscriptions table with last_updated column already exists';
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql; 