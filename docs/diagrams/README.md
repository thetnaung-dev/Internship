# Nestfinder — Diagrams

UML / architecture diagrams for the Nestfinder (Expo + Supabase) app. Each diagram lives as a standalone Mermaid `.mmd` file and is embedded below so GitHub renders it in this README.

| Diagram | File | Description |
| --- | --- | --- |
| Flow chart | [flowchart.mmd](./flowchart.mmd) | App-level navigation and feature flow |
| Sequence diagram (app flow) | [sequence-app.mmd](./sequence-app.mmd) | Full app flow: splash, onboarding, home tabs, login, property detail, chat, create post, profile/saved, wanted, settings |
| Sequence diagram (save flow) | [sequence.mmd](./sequence.mmd) | Save / unsave a property with cross-screen sync |
| Class diagram | [class.mmd](./class.mmd) | Supabase tables as ER-style tables with 1..* / 0..* relations |
| ER diagram | [er.mmd](./er.mmd) | Supabase database schema and relationships |
| Use case diagram | [usecase.mmd](./usecase.mmd) | Actors and their use cases (rendered as a flowchart; GitHub Mermaid has no `useCaseDiagram` support) |

## Flow chart

```mermaid
flowchart TD
    A([Start]) --> B[Splash Screen]
    B --> C{Signed in?}
    C -- No --> D[Onboarding]
    D --> E[Choose Language]
    E --> F[Enter Name]
    F --> G[Welcome Screen]
    G --> H[Tap Get Started]
    H --> I[Home Screen]
    C -- Yes --> I

    I --> J[Home Tab - Browse Properties]
    I --> K[Search - Search & Filter Properties]
    I --> L[Create Post Tab]
    I --> M[Chat Tab - Conversations]
    I --> N[Map Tab - Map View]
    I --> O[Profile Tab]

    J --> P[Open Property Card]
    K --> P
    N --> P
    P --> Q[Property Detail]
    Q --> R[View Gallery / Details / Map]
    Q --> S[Save / Unsave Property]
    Q --> T[Add to Compare List]
    Q --> U[Share Property]
    Q --> V[Call Agent]
    Q --> W[Open Chat with Agent]
    Q --> X[View Agent Profile]

    S -- guest --> Y[Login / Register]
    T -- guest --> Y
    W -- guest --> Y

    L -- guest --> Y
    L --> Z[Post Form]
    Z --> AA[Enter Title, Price, Type, Details, Photos]
    AA --> AB[Submit Listing]

    M --> AC[Conversation List]
    AC --> AD[Open Conversation]
    AD --> AE[Send / Receive Messages]

    O --> AF[Saved Properties]
    O --> AG[My Listings]
    AG --> AH[Manage Listings / Mark Sold or Rented]
    O --> AI[Wanted Listings]
    AI --> AJ[Create Wanted Listing]
    O --> AK[Edit Profile]
    O --> AL[Settings]
    AL --> AM[Account Settings]
    AL --> AN[Notification Settings]
    AL --> AO[Privacy Settings]

    Y --> I
    AE --> AC

    B --> SB[(Supabase - Auth / Database / Storage)]
    C --> SB
    Y --> SB
    J --> SB
    K --> SB
    AA --> SB
    AE --> SB
    AF --> SB
    AJ --> SB

    I -- Exit app --> Z([End])
```

## Sequence diagram — app flow (from flowchart)

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant S as Splash
    participant O as Onboarding
    participant H as Home
    participant L as Login / Register
    participant D as Property Detail
    participant C as Chat
    participant F as Post Form
    participant P as Profile / Saved
    participant W as Wanted Listings
    participant DB as Supabase

    U->>S: Launch app
    S->>DB: Check saved session
    DB-->>S: Session status

    alt signed in
        S->>H: Go to Home
    else signed out
        S->>O: Show onboarding
        U->>O: Choose language
        U->>O: Enter name
        U->>O: Tap Get Started
        O->>H: Go to Home
    end

    U->>H: Browse / Search / Map / Profile tabs
    H->>DB: Fetch properties
    DB-->>H: Property list

    U->>H: Open property card
    H->>D: Open Property Detail
    U->>D: View gallery / details / map
    D->>DB: Track property view

    U->>D: Save / Compare / Chat / Call / Share
    alt guest
        D->>L: Open Login / Register
        U->>L: Email or Google sign in
        L->>DB: Authenticate
        L-->>H: Session stored, back to Home
    end

    U->>D: Open chat with agent
    D->>C: Open conversation
    U->>C: Send / receive messages
    C->>DB: Fetch / send messages

    U->>H: Create Post tab
    alt guest
        H->>L: Open Login / Register
        U->>L: Email or Google sign in
        L-->>H: Session stored, back to Home
    end
    H->>F: Open post form
    U->>F: Enter title, price, type, details, photos
    F->>DB: Submit listing
    DB-->>F: Listing created

    U->>H: Profile tab
    H->>P: Open Profile / Saved / My Listings
    P->>DB: Fetch saved properties
    U->>P: View saved properties
    P->>DB: Manage listings / mark sold or rented

    U->>P: Open Wanted Listings
    P->>W: Create wanted listing
    U->>W: Enter wanted details
    W->>DB: Submit wanted listing

    U->>P: Open Settings
    P->>P: Account / Notification / Privacy settings

    U->>S: Exit app
    S->>S: End
```

## Sequence diagram — save / unsave a property

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant C as Property Card
    participant H as HomeScreen
    participant S as Supabase
    participant EB as Event Bus
    participant SP as SavedPropertiesScreen

    U->>C: Tap heart icon
    C->>H: onSave(propertyId)
    H->>S: auth.getUser()

    opt user not signed in
        H->>U: Redirect to Login and stop
    end

    Note over H: Check local savedIds.has(propertyId)

    opt already saved
        H->>S: DELETE saved_properties(propertyId)
    end

    opt not saved
        H->>S: INSERT saved_properties(userId, propertyId)
    end

    H-->>C: savedIds updated, heart re-renders
    C->>U: Show animated heart state
    H->>EB: emit("savedPropertiesChanged")
    Note over EB,SP: Cross-screen sync
    EB-->>SP: listener refreshes saved list
    SP->>S: SELECT saved_properties
```

## Class diagram

> Supabase tables modeled as ER-style tables (classes = DB entities). Relation symbols: `||` = 1..1, `o|` = 0..1, `}o` = 0..*, `}|` = 1..*. Relationship types: **association** (independent life), **aggregation** (part can outlive the whole), **composition** (part is deleted with the whole).

```mermaid
erDiagram
    AUTH_USERS {
        uuid id PK
    }

    PROFILES {
        uuid id PK
        text full_name
        text avatar_url
        text email
        text phone
        text city
        text region
    }

    STATES_REGIONS {
        text id PK
        text name_en
        text name_mm
    }

    TOWNSHIPS {
        text id PK
        text region_id FK
        text name_en
        text name_mm
    }

    PROPERTIES {
        uuid id PK
        uuid user_id FK
        text title_en
        text title_mm
        text description
        text deal_type
        text property_type
        numeric price
        text currency_unit
        jsonb images
        text video_url
        int bedrooms
        int bathrooms
        numeric width
        numeric length
        numeric sqft
        numeric area_value
        text area_unit
        text floor
        text state_region_id FK
        text township_id FK
        text search_value
        int ad_number
        boolean is_sold
        boolean is_rented
        timestamptz sold_at
        int views
        float latitude
        float longitude
        timestamptz created_at
    }

    SAVED_PROPERTIES {
        uuid id PK
        uuid user_id FK
        uuid property_id FK
        timestamptz created_at
    }

    CONVERSATIONS {
        uuid id PK
        uuid property_id FK
        uuid buyer_id FK
        uuid seller_id FK
        boolean muted
        boolean archived
        boolean pinned
        int buyer_unread_count
        int seller_unread_count
        timestamptz created_at
        timestamptz updated_at
    }

    MESSAGES {
        uuid id PK
        uuid conversation_id FK
        uuid sender_id FK
        text text
        jsonb attachment
        uuid reply_to_id FK
        boolean pinned_by_buyer
        boolean pinned_by_seller
        timestamptz read_at
        timestamptz created_at
    }

    WANTED_LISTINGS {
        uuid id PK
        uuid user_id FK
        text title
        text description
        text deal_type
        text property_type
        text region_id FK
        text township_id FK
        numeric budget_min
        numeric budget_max
        text currency_unit
        numeric monthly_fee_from
        numeric monthly_fee_to
        numeric area_from
        numeric area_to
        text area_unit
        text furnished_status
        text floor
        text contact_phone
        text status
        int views
        int bedrooms
        int bathrooms
        boolean co_brokerage
        timestamptz created_at
    }

    SAVED_SEARCHES {
        uuid id PK
        uuid user_id FK
        text name
        jsonb search_params
        timestamptz created_at
    }

    PUSH_TOKENS {
        uuid id PK
        uuid user_id FK
        text token
        text platform
        timestamptz created_at
        timestamptz updated_at
    }

    PROPERTY_VIEWS {
        uuid user_id PK
        uuid property_id PK
        timestamptz viewed_at
    }

    WANTED_LISTING_VIEWS {
        uuid user_id PK
        uuid listing_id PK
        timestamptz viewed_at
    }

    AUTH_USERS ||--|| PROFILES : "has (1 : 1..1) - association"
    AUTH_USERS ||--o{ PROPERTY_VIEWS : "viewed (1 : 0..*) - association"
    AUTH_USERS ||--o{ WANTED_LISTING_VIEWS : "viewed (1 : 0..*) - association"

    PROFILES ||--o{ PROPERTIES : "owns (1 : 0..*) - aggregation"
    PROFILES ||--o{ SAVED_PROPERTIES : "saves (1 : 0..*) - composition"
    PROFILES ||--o{ CONVERSATIONS : "buyer (1 : 0..*) - aggregation"
    PROFILES ||--o{ CONVERSATIONS : "seller (1 : 0..*) - aggregation"
    PROFILES ||--o{ MESSAGES : "sends (1 : 0..*) - composition"
    PROFILES ||--o{ WANTED_LISTINGS : "posts (1 : 0..*) - composition"
    PROFILES ||--o{ SAVED_SEARCHES : "owns (1 : 0..*) - composition"
    PROFILES ||--o{ PUSH_TOKENS : "registers (1 : 0..*) - composition"

    STATES_REGIONS ||--o{ TOWNSHIPS : "contains (1 : 0..*) - association"
    STATES_REGIONS ||--o{ PROPERTIES : "locates (1 : 0..*) - association"
    TOWNSHIPS ||--o{ PROPERTIES : "locates (1 : 0..*) - association"
    STATES_REGIONS ||--o{ WANTED_LISTINGS : "locates (1 : 0..*) - association"
    TOWNSHIPS ||--o{ WANTED_LISTINGS : "locates (1 : 0..*) - association"

    PROPERTIES ||--o{ SAVED_PROPERTIES : "saved by (1 : 0..*) - composition"
    PROPERTIES ||--o{ CONVERSATIONS : "about (1 : 0..*) - composition"
    PROPERTIES ||--o{ PROPERTY_VIEWS : "tracked by (1 : 0..*) - composition"

    CONVERSATIONS ||--}| MESSAGES : "contains (1 : 1..*) - composition"

    WANTED_LISTINGS ||--o{ WANTED_LISTING_VIEWS : "tracked by (1 : 0..*) - composition"
```

## ER diagram

```mermaid
erDiagram
    PROFILES {
        uuid id PK
        text full_name
        text avatar_url
        text phone
        text city
        text region
        timestamptz created_at
    }

    PROPERTIES {
        uuid id PK
        uuid user_id FK
        text title_en
        text title_mm
        numeric price
        text currency_unit
        text deal_type
        text property_type
        text[] images
        int bedrooms
        int bathrooms
        numeric area_value
        text area_unit
        numeric width
        numeric length
        text floor
        text furnished_status
        text region_id FK
        text township_id FK
        boolean is_sold
        int views
        float latitude
        float longitude
        timestamptz created_at
    }

    SAVED_PROPERTIES {
        uuid id PK
        uuid user_id FK
        uuid property_id FK
        timestamptz created_at
    }

    CONVERSATIONS {
        uuid id PK
        uuid property_id FK
        uuid buyer_id FK
        uuid seller_id FK
        timestamptz created_at
        timestamptz updated_at
    }

    MESSAGES {
        uuid id PK
        uuid conversation_id FK
        uuid sender_id FK
        text text
        jsonb attachment
        timestamptz read_at
        boolean pinned_by_buyer
        boolean pinned_by_seller
        timestamptz created_at
    }

    WANTED_LISTINGS {
        uuid id PK
        uuid user_id FK
        text title
        text description
        text deal_type
        text property_type
        text region_id FK
        text township_id FK
        numeric budget_min
        numeric budget_max
        text contact_phone
        text status
        timestamptz created_at
    }

    SAVED_SEARCHES {
        uuid id PK
        uuid user_id FK
        text name
        jsonb search_params
        timestamptz created_at
    }

    PUSH_TOKENS {
        uuid id PK
        uuid user_id FK
        text token
        text platform
        timestamptz created_at
    }

    STATES_REGIONS {
        text id PK
        text name_en
        text name_mm
    }

    TOWNSHIPS {
        text id PK
        text region_id FK
        text name_en
        text name_mm
    }

    PROFILES ||--o{ PROPERTIES : owns
    PROFILES ||--o{ SAVED_PROPERTIES : saves
    PROPERTIES ||--o{ SAVED_PROPERTIES : "saved by"
    PROFILES ||--o{ CONVERSATIONS : "buyer"
    PROFILES ||--o{ CONVERSATIONS : "seller"
    PROPERTIES ||--o{ CONVERSATIONS : "about"
    CONVERSATIONS ||--o{ MESSAGES : contains
    PROFILES ||--o{ MESSAGES : sends
    STATES_REGIONS ||--o{ TOWNSHIPS : contains
    STATES_REGIONS ||--o{ PROPERTIES : locates
    TOWNSHIPS ||--o{ PROPERTIES : locates
    STATES_REGIONS ||--o{ WANTED_LISTINGS : locates
    TOWNSHIPS ||--o{ WANTED_LISTINGS : locates
    PROFILES ||--o{ WANTED_LISTINGS : posts
    PROFILES ||--o{ SAVED_SEARCHES : owns
    PROFILES ||--o{ PUSH_TOKENS : registers
```

## Use case diagram

> GitHub Mermaid does not support the native `useCaseDiagram` type, so the use case model is rendered as a flowchart below. Use cases are grouped per actor.

```mermaid
flowchart LR
    Guest([Guest])
    User([Registered User / Buyer])
    Agent([Agent / Seller])
    System([System])

    subgraph GuestUC [Guest]
        G1[Browse Properties]
        G2[Search & Filter Properties]
        G3[View Property Detail]
        G4[View Map / Get Directions]
        G5[Call Agent]
        G6[Share Property]
        G7[Switch Language / Theme]
        G8[Register / Login]
    end

    subgraph UserUC [Registered User]
        U1[Save / Unsave Property]
        U2[Compare Properties]
        U3[Chat with Agent]
        U4[Manage Saved Properties]
        U5[Post Wanted Listing]
        U6[Save Search]
        U7[Edit Profile]
        U8[Manage Settings / Notifications]
        U9[Create Property Listing]
    end

    subgraph AgentUC [Agent / Seller]
        A1[Create Property Listing]
        A2[Manage Own Listings]
        A3[Mark Listing Sold / Rented]
        A4[Respond to Buyers via Chat]
        A5[View Agent Profile & Stats]
        A6[Offer Co-brokerage]
    end

    subgraph SystemUC [System]
        S1[Authenticate Email / Google]
        S2[Reset Password]
        S3[Send Push Notifications]
        S4[Track Property Views]
        S5[Track Wanted Listing Views]
        S6[Enforce Monthly Post Limit]
    end

    Guest --> GuestUC
    User --> UserUC
    Agent --> AgentUC
    System --> SystemUC
```
