# Nestfinder — Diagrams

UML / architecture diagrams for the Nestfinder (Expo + Supabase) app. Each diagram lives as a standalone Mermaid `.mmd` file and is embedded below so GitHub renders it in this README.

| Diagram | File | Description |
| --- | --- | --- |
| Flow chart | [flowchart.mmd](./flowchart.mmd) | App-level navigation and feature flow |
| Sequence diagram | [sequence.mmd](./sequence.mmd) | Save / unsave a property with cross-screen sync |
| Class diagram | [class.mmd](./class.mmd) | Main screens, components, stores and services |
| ER diagram | [er.mmd](./er.mmd) | Supabase database schema and relationships |
| Use case diagram | [usecase.mmd](./usecase.mmd) | Actors and their use cases |

## Flow chart

```mermaid
%%{init: {"flowchart": {"curve": "linear"}} }%%
flowchart TD
    A([App Launch]) --> B[Splash screen]
    B --> C{Authenticated?}
    C -- No --> D[(Login / Register)]
    C -- Yes --> E[Load language & theme]
    D -- success --> E
    E --> F[Home tab]

    F --> G[Browse property feed]
    G --> H{User action}
    H -- Tap card --> I[Property Detail]
    H -- Heart --> J[Save / Unsave property]
    H -- Compare --> K[Add to Compare]
    H -- Share --> L[Share sheet]

    I --> M[View photos / video]
    I --> N[Open map]
    I --> O[Contact agent]
    O --> P[Call agent]
    O --> Q[Chat with agent]

    Q --> R[(Conversation)]
    R --> S[Send / receive messages]

    H -- Search --> T[Search & filter]
    H -- Map --> U[Map tab / locate listings]
    H -- Create --> V[Create Post form]
    V --> W[Validate & upload images]
    W --> X[Insert property]
    X --> Y[My Listings]
    H -- Saved --> Z[Saved Properties]
    H -- Profile --> AA[Profile screen]
    AA --> AB[Edit profile]
    AA --> AC[Settings]
    AC --> AD[Language / Dark mode]
    H -- Wanted --> AE[Post / view wanted listings]

    F --> AF{New push notification?}
    AF -- Yes --> AG[Open chat or property]
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
        H->>U: Redirect to Login
    end

    opt already saved
        S-->>H: savedIds contains propertyId
        H->>S: DELETE saved_properties(propertyId)
    end

    opt not saved
        H->>S: INSERT saved_properties(userId, propertyId)
    end

    H-->>U: Update heart icon (animated)
    H->>EB: emit("savedPropertiesChanged")
    Note over EB,SP: Cross-screen sync
    EB-->>SP: listener refreshes saved list
    SP->>S: SELECT saved_properties
```

## Class diagram

```mermaid
classDiagram
    direction LR

    class SupabaseClient {
        +auth
        +from(table)
        +storage
        +rpc(name)
    }

    class i18n {
        +language
        +changeLanguage(lang)
    }

    class Notifications {
        +registerForPushNotifications()
        +savePushToken()
        +setupNotificationListeners()
    }

    class useThemeStore {
        +theme
        +resolvedTheme
        +setTheme()
        +loadTheme()
    }

    class useLanguageStore {
        +language
        +setLanguage()
        +loadLanguage()
    }

    class useCompareStore {
        +items: Property[]
        +add(property)
        +remove(id)
        +clear()
    }

    class useNetworkStore {
        +isOnline
        +setOnline()
    }

    class Property {
        +id: string
        +title_en: string
        +title_mm: string
        +price: number
        +currency_unit: string
        +deal_type: string
        +property_type: string
        +images: string[]
        +area_value: number
        +area_unit: string
        +floor: string
        +views: number
        +is_sold: boolean
    }

    class Profile {
        +id: string
        +full_name: string
        +avatar_url: string
        +phone: string
        +city: string
        +region: string
    }

    class Card {
        +item: Property
        +isSaved: boolean
        +onSave()
        +onCompare()
    }

    class Skeleton {
        +PropertyCardSkeleton
        +PropertyListSkeleton
        +ChatListSkeleton
        +ProfileSkeleton
    }

    class SegmentedToggle {
        +options
        +value
        +onChange()
    }

    class HomeScreen {
        -properties: Property[]
        -savedIds: Set
        +fetchProperties(category)
        +handleSave(propertyId)
    }

    class PropertyDetailScreen {
        -property: Property
        -agent: Profile
        -related: Property[]
        +fetchPropertyDetails()
        +handleChat()
    }

    class AgentScreen {
        -agent: Profile
        -listings: Property[]
        -stats
        +handleCall()
        +handleChat()
    }

    class SearchScreen {
        -results: Property[]
        -filters
        +handleSearchSubmit()
    }

    class ChatScreen {
        -messages: Message[]
        +sendMessage()
    }

    HomeScreen --> Card : renders
    PropertyDetailScreen --> Card : renders
    AgentScreen --> Card : renders
    SearchScreen --> Card : renders
    HomeScreen --> SupabaseClient
    PropertyDetailScreen --> SupabaseClient
    AgentScreen --> SupabaseClient
    ChatScreen --> SupabaseClient
    HomeScreen --> useCompareStore
    HomeScreen --> useThemeStore
    useLanguageStore --> i18n : changes language
    Notifications --> SupabaseClient
    useThemeStore --> useNetworkStore
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

```mermaid
useCaseDiagram
    actor Guest
    actor User as "Registered User (Buyer)"
    actor Agent as "Registered User (Seller / Agent)"
    actor System

    Guest --> (Browse Properties)
    Guest --> (Register Account)
    Guest --> (Login)
    Guest --> (Switch Language)

    User --> (Search & Filter Properties)
    User --> (View Property Detail)
    User --> (Save / Unsave Property)
    User --> (Compare Properties)
    User --> (View Map / Get Directions)
    User --> (Call Agent)
    User --> (Chat with Agent)
    User --> (Manage Saved Properties)
    User --> (Post Wanted Listing)
    User --> (Save Search)
    User --> (Edit Profile)
    User --> (Change Settings)
    User --> (Toggle Dark Mode)

    Agent --> (Create Property Listing)
    Agent --> (Manage Own Listings)
    Agent --> (Respond to Buyers via Chat)
    Agent --> (View Agent Profile)

    System --> (Authenticate via Email / Google)
    System --> (Send Push Notifications)
    System --> (Track Property Views)
    System --> (Enforce Monthly Post Limit)
```
