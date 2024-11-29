List all tables:

| table_name    |
| ------------- |
| ride_groups   |
| ride_requests |
| notifications |
| profiles      |


ride_groups

| column_name        | data_type                | is_nullable |
| ------------------ | ------------------------ | ----------- |
| id                 | uuid                     | NO          |
| ride_request_id    | uuid                     | NO          |
| total_capacity     | integer                  | NO          |
| remaining_capacity | integer                  | NO          |
| members            | ARRAY                    | NO          |
| created_at         | timestamp with time zone | YES         |
| updated_at         | timestamp with time zone | YES         |

ride_requests
| column_name       | data_type                   | is_nullable |
| ----------------- | --------------------------- | ----------- |
| id                | uuid                        | NO          |
| user_id           | uuid                        | NO          |
| source            | text                        | NO          |
| destination       | text                        | NO          |
| time_slot         | timestamp without time zone | NO          |
| seats_required    | integer                     | NO          |
| status            | text                        | NO          |
| gender_preference | text                        | NO          |
| user_details      | jsonb                       | NO          |
| created_at        | timestamp with time zone    | YES         |
| selected_car      | text                        | YES         |
| car_details       | jsonb                       | YES         |

notifications
| column_name | data_type                | is_nullable |
| ----------- | ------------------------ | ----------- |
| id          | uuid                     | NO          |
| user_id     | uuid                     | NO          |
| message     | text                     | NO          |
| type        | text                     | NO          |
| read        | boolean                  | YES         |
| created_at  | timestamp with time zone | YES         |

profiles

| column_name  | data_type                | is_nullable |
| ------------ | ------------------------ | ----------- |
| id           | uuid                     | NO          |
| email        | text                     | YES         |
| full_name    | text                     | YES         |
| phone_number | text                     | YES         |
| updated_at   | timestamp with time zone | YES         |


policies:
# **RLS Policies Overview**

## **Notifications**
- rls enabled 
- **Policies**:
  - **SELECT**:  
    *Users can view their own notifications.*  
    *Applied to*: `authenticated` role.  

  - **SELECT**:  
    *Users can view their own notifications and profiles.*  
    *Applied to*: `authenticated` role.  

---

## **Profiles**
- rls enabled 
- **Policies**:
  - **SELECT**:  
    *Allow admin read access to profiles.*  
    *Applied to*: `public` role.  

  - **SELECT**:  
    *Anyone can read profiles.*  
    *Applied to*: `authenticated` role.  

  - **INSERT**:  
    *Users can insert their own profile.*  
    *Applied to*: `authenticated` role.  

  - **UPDATE**:  
    *Users can update their own profile.*  
    *Applied to*: `authenticated` role.  

---

## **Ride Groups**
- rls enabled 
- **Policies**:
  - **SELECT**:  
    *Allow admin read access to ride_groups.*  
    *Applied to*: `public` role.  

  - **SELECT**:  
    *Anyone can read ride_groups.*  
    *Applied to*: `authenticated` role.  

  - **INSERT**:  
    *Enable insert access for authenticated users.*  
    *Applied to*: `authenticated` role.  

  - **SELECT**:  
    *Enable read access for authenticated users.*  
    *Applied to*: `authenticated` role.  

  - **UPDATE**:  
    *Enable update access for authenticated users.*  
    *Applied to*: `authenticated` role.  

  - **INSERT**:  
    *Users can create and join ride groups.*  
    *Applied to*: `authenticated` role.  

  - **INSERT**:  
    *Users can create ride groups.*  
    *Applied to*: `authenticated` role.  

  - **INSERT**:  
    *Users can create ride_groups.*  
    *Applied to*: `authenticated` role.  

  - **UPDATE**:  
    *Users can update groups they're part of.*  
    *Applied to*: `public` role.  

  - **UPDATE**:  
    *Users can update ride groups.*  
    *Applied to*: `authenticated` role.  

  - **UPDATE**:  
    *Users can update ride_groups.*  
    *Applied to*: `authenticated` role.  

  - **SELECT**:  
    *Users can view all ride groups.*  
    *Applied to*: `authenticated` role.  

  - **SELECT**:  
    *Users can view ride groups.*  
    *Applied to*: `authenticated` role.  

---

## **Ride Requests**
- rls enabled 
- **Policies**:
  - **SELECT**:  
    *Allow admin read access to ride_requests.*  
    *Applied to*: `public` role.  

  - **SELECT**:  
    *Anyone can read ride_requests.*  
    *Applied to*: `authenticated` role.  

  - **UPDATE**:  
    *Users can cancel their own requests.*  
    *Applied to*: `authenticated` role.  

  - **INSERT**:  
    *Users can create ride_requests.*  
    *Applied to*: `authenticated` role.  

  - **INSERT**:  
    *Users can create their own ride requests.*  
    *Applied to*: `public` role.  

  - **UPDATE**:  
    *Users can update their own ride requests.*  
    *Applied to*: `public` role.  

  - **UPDATE**:  
    *Users can update their own ride_requests.*  
    *Applied to*: `authenticated` role.  

  - **SELECT**:  
    *Users can view all pending ride requests.*  
    *Applied to*: `public` role.  
