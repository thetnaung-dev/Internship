# Nestfinder — Diagrams

UML / architecture diagrams for the Nestfinder (Expo + Supabase) app. Each diagram lives as a standalone Mermaid `.mmd` file and is embedded below so GitHub renders it in this README.

| Diagram | File | Description |
| --- | --- | --- |
| Flow chart | [flowchart.mmd](./flowchart.mmd) | App-level navigation and feature flow |
| Sequence diagram (app flow) | [sequence-app.mmd](./sequence-app.mmd) | UI-screen flow: onboarding, home, login, detail, chat/create, profile/saved |
| Sequence diagram (save flow) | [sequence.mmd](./sequence.mmd) | Save / unsave a property with cross-screen sync |
| Class diagram | [class.mmd](./class.mmd) | Classes as ER-style tables with 1..* / 0..* relations |
| ER diagram | [er.mmd](./er.mmd) | Supabase database schema and relationships |
| Use case diagram | [usecase.mmd](./usecase.mmd) | Actors and their use cases (rendered as a flowchart; GitHub Mermaid has no `useCaseDiagram` support) |

## Flow chart

```mermaid
flowchart TD
    A([Start]) --> B[Splash]
    B --> C{Signed in?}
    C -- No --> D[Onboarding]
    D --> E[Get Started]
    E --> F[Home]
    C -- Yes --> F

    F --> G[Browse & view properties]
    F --> H[Search / Map / Property detail]
    F --> I[Save / Compare / Share]
    F --> J[Chat / Create post / Profile]

    I -- guest --> K[Login / Register]
    J -- guest --> K
    K --> F

    C --> SB[(Supabase - Auth / Database / Storage)]
    K --> SB
    G --> SB
    H --> SB
    I --> SB
    J --> SB

    F -- Exit app --> Z([End])
```

## Sequence diagram — app flow (from flowchart)

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant O as Onboarding
    participant H as Home
    participant L as Login / Register
    participant D as Property Detail
    participant C as Chat / Create Post
    participant P as Profile / Saved

    U->>O: Launch app
    O->>O: Check saved session

    opt signed in
        O->>H: Go to Home
    end

    opt signed out
        O->>O: Show onboarding
        U->>O: Tap Get Started
        O->>H: Go to Home
    end

    U->>H: Browse / Search / Map
    H->>D: Open property
    U->>D: View details / map / agent
    D->>H: Back to Home

    U->>H: Save / Chat / Create post / Profile
    opt guest
        H->>L: Open Login / Register
        U->>L: Email / Google
        L->>H: Session stored, back to Home
    end
    H->>C: Open Chat / Create post
    H->>P: Open Profile / Saved

    U->>O: Exit app
    O->>O: End
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

> Modeled as ER-style tables. Cardinality: `||` = 1, `o{` = 0..*, `o|` = 0..1.

```mermaid
erDiagram
    PROPERTY {
        uuid id PK
        text title_en
        text title_mm
        numeric price
        text currency_unit
        text deal_type
        text property_type
        text[] images
        numeric area_value
        text area_unit
        text floor
        int views
        boolean is_sold
    }

    PROFILE {
        uuid id PK
        text full_name
        text avatar_url
        text phone
        text city
        text region
    }

    CONVERSATION {
        uuid id PK
        uuid property_id FK
        uuid buyer_id FK
        uuid seller_id FK
        timestamptz created_at
    }

    MESSAGE {
        uuid id PK
        uuid conversation_id FK
        uuid sender_id FK
        text text
        timestamptz read_at
    }

    CARD {
        property item
        boolean isSaved
    }

    HOME_SCREEN {
        property[] properties
        set savedIds
    }

    PROPERTY_DETAIL_SCREEN {
        property property
        profile agent
        property[] related
    }

    AGENT_SCREEN {
        profile agent
        property[] listings
    }

    SEARCH_SCREEN {
        property[] results
        object filters
    }

    CHAT_SCREEN {
        message[] messages
    }

    SUPABASE_CLIENT {
        auth
        from(table)
        storage
        rpc(name)
    }

    I18N {
        language
    }

    NOTIFICATIONS {
        registerForPushNotifications()
        savePushToken()
    }

    USE_THEME_STORE {
        theme
        resolvedTheme
    }

    USE_LANGUAGE_STORE {
        language
    }

    USE_COMPARE_STORE {
        property[] items
    }

    USE_NETWORK_STORE {
        boolean isOnline
    }

    HOME_SCREEN ||--o{ CARD : renders
    PROPERTY_DETAIL_SCREEN ||--o{ CARD : renders
    AGENT_SCREEN ||--o{ CARD : renders
    SEARCH_SCREEN ||--o{ CARD : renders
    CARD ||--|| PROPERTY : shows

    HOME_SCREEN ||--o{ PROPERTY : loads
    SEARCH_SCREEN ||--o{ PROPERTY : shows results
    PROPERTY_DETAIL_SCREEN ||--|| PROPERTY : displays
    PROPERTY_DETAIL_SCREEN ||--o| PROFILE : shows agent
    AGENT_SCREEN ||--|| PROFILE : displays
    AGENT_SCREEN ||--o{ PROPERTY : lists

    CONVERSATION ||--o{ MESSAGE : contains
    CONVERSATION ||--|| PROPERTY : about
    CONVERSATION ||--|| PROFILE : buyer
    CONVERSATION ||--|| PROFILE : seller
    CHAT_SCREEN ||--|| CONVERSATION : displays

    HOME_SCREEN ||--|| SUPABASE_CLIENT : uses
    PROPERTY_DETAIL_SCREEN ||--|| SUPABASE_CLIENT : uses
    AGENT_SCREEN ||--|| SUPABASE_CLIENT : uses
    CHAT_SCREEN ||--|| SUPABASE_CLIENT : uses
    NOTIFICATIONS ||--|| SUPABASE_CLIENT : uses

    HOME_SCREEN ||--|| USE_COMPARE_STORE : uses
    HOME_SCREEN ||--|| USE_THEME_STORE : uses
    USE_LANGUAGE_STORE ||--|| I18N : changes language
    USE_THEME_STORE ||--|| USE_NETWORK_STORE : observes
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

> GitHub Mermaid does not support the native `useCaseDiagram` type, so the use case model is rendered as a flowchart below.

```mermaid
flowchart LR
    Guest([Guest])
    User([Registered User / Buyer])
    Agent([Registered User / Seller - Agent])
    System([System])

    Guest --> G1[Browse Properties]
    Guest --> G2[Register Account]
    Guest --> G3[Login]
    Guest --> G4[Switch Language]

    User --> U1[Search & Filter Properties]
    User --> U2[View Property Detail]
    User --> U3[Save / Unsave Property]
    User --> U4[Compare Properties]
    User --> U5[View Map / Get Directions]
    User --> U6[Call Agent]
    User --> U7[Chat with Agent]
    User --> U8[Manage Saved Properties]
    User --> U9[Post Wanted Listing]
    User --> U10[Save Search]
    User --> U11[Edit Profile]
    User --> U12[Change Settings]
    User --> U13[Toggle Dark Mode]

    Agent --> A1[Create Property Listing]
    Agent --> A2[Manage Own Listings]
    Agent --> A3[Respond to Buyers via Chat]
    Agent --> A4[View Agent Profile]

    System --> S1[Authenticate via Email / Google]
    System --> S2[Send Push Notifications]
    System --> S3[Track Property Views]
    System --> S4[Enforce Monthly Post Limit]
```
