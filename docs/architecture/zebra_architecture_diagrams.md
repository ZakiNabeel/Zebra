# 🦓 Zebra — Architecture Diagrams
### All 12 Modules: Use Case + System Sequence Diagrams

> ⚠️ **Superseded (2026-06-11 pivot).** These diagrams describe the v1 Flutter + on-device-SLM ("Edge AI") architecture, which has been scrapped. The current direction is a web-first Next.js + Supabase + Capacitor stack with creation-time cloud AI behind a moderation/approval gate — see [docs/plan/03-tech-stack.md](../plan/03-tech-stack.md). The module breakdown (IAM, curation, safety, sync, compliance…) remains a useful functional reference; the Edge-SLM/self-hosted-GPU deployment model does not. Edge/on-device inference is retained only as a possible future cost optimization.

> **Legend**  
> 🟦 **Edge AI (On-Device SLM)** — runs locally on the user's device, no cloud required  
> 🟧 **Cloud GPU** — self-hosted inference server for heavy generative workloads  
> 🟩 **System / Backend** — application services, databases, APIs  

---

## MODULE 1 — Identity, Access Management (IAM) & Role-Based Security

### 1.1 Use Case Diagram

```mermaid
graph LR
    subgraph Actors
        P(["👤 Parent"])
        C(["👦 Child"])
    end

    subgraph System ["🟩 System"]
        UC1["Register Account\n(Email / OAuth)"]
        UC2["Login / Logout"]
        UC3["Enable MFA / Biometric Auth"]
        UC4["Create Child Profiles"]
        UC5["Assign Roles\n(Parent / Co-Parent / Child)"]
        UC6["Approve Devices"]
        UC7["Switch Child Profiles"]
        UC8["Remote Logout"]
        UC9["Login via PIN\n(Restricted Access)"]
        UC10["Access Child-Safe Interface"]
        UC11["Authenticate Credentials"]
        UC12["Authorize Roles (RBAC)"]
        UC13["Manage Sessions"]
        UC14["Validate Devices"]
        UC15["Enforce Access Restrictions"]
    end

    P --> UC1
    P --> UC2
    P --> UC3
    P --> UC4
    P --> UC5
    P --> UC6
    P --> UC7
    P --> UC8
    C --> UC9
    C --> UC10
    UC2 --> UC11
    UC11 --> UC12
    UC12 --> UC13
    UC6 --> UC14
    UC12 --> UC15
```

### 1.2 System Sequence Diagram

```mermaid
sequenceDiagram
    actor Parent
    participant App as 🟩 App Client
    participant AuthSvc as 🟩 Auth Service
    participant DeviceSvc as 🟩 Device Validator
    participant RBAC as 🟩 RBAC Service
    participant SessionSvc as 🟩 Session Manager

    Parent->>App: Initiate Login (credentials / OAuth)
    App->>AuthSvc: Forward credentials
    AuthSvc-->>App: Identity validated ✅

    App->>DeviceSvc: Check device authorization
    DeviceSvc-->>App: Device approved ✅

    App->>RBAC: Retrieve role for user
    RBAC-->>App: Role = "Parent"

    App->>SessionSvc: Create secure session token
    SessionSvc-->>App: Token issued

    App-->>Parent: Access granted → Dashboard

    Parent->>App: Select child profile
    App->>RBAC: Validate child access permissions
    RBAC-->>App: Permissions confirmed

    App->>App: Switch to Child Mode\n(Restricted UI + PIN Lock)
    App-->>Parent: Child mode active\n(session persists with RBAC restrictions)
```

---

## MODULE 2 — Parent Dashboard & Content Curation

### 2.1 Use Case Diagram

```mermaid
graph LR
    subgraph Actors
        P(["👤 Parent"])
    end

    subgraph EdgeAI ["🟦 Edge AI (SLM)"]
        EA1["Generate Text Content"]
    end

    subgraph System ["🟩 System"]
        UC1["Create Story Prompts"]
        UC2["Edit Generated Stories"]
        UC3["Approve / Reject AI Content"]
        UC4["Organize Content\n(Folders / Tags)"]
        UC5["Schedule Story Releases"]
        UC6["Search & Filter Content"]
        UC7["Store Content"]
        UC8["Trigger AI Generation"]
        UC9["Maintain Content Versions"]
        UC10["Sync Across Devices"]
    end

    P --> UC1
    P --> UC2
    P --> UC3
    P --> UC4
    P --> UC5
    P --> UC6
    UC1 --> UC8
    UC8 --> EA1
    EA1 --> UC2
    UC3 --> UC7
    UC7 --> UC9
    UC9 --> UC10
```

### 2.2 System Sequence Diagram

```mermaid
sequenceDiagram
    actor Parent
    participant App as 🟩 App Client
    participant EdgeSLM as 🟦 Edge SLM
    participant ContentDB as 🟩 Content Database
    participant SyncSvc as 🟩 Sync Service

    Parent->>App: Input story prompt
    App->>EdgeSLM: Send prompt for generation
    EdgeSLM-->>App: Return story draft

    App-->>Parent: Display story draft

    Parent->>App: Edit / refine content
    Parent->>App: Approve content

    App->>ContentDB: Store approved version
    ContentDB-->>App: Stored ✅

    App->>ContentDB: Tag and index content
    App->>SyncSvc: Sync to other devices

    App-->>Parent: Content available for child consumption
```

---

## MODULE 3 — Edge AI Text & NLP Engine (On-Device)

### 3.1 Use Case Diagram

```mermaid
graph LR
    subgraph Actors
        P(["👤 Parent"])
        C(["👦 Child"])
    end

    subgraph EdgeAI ["🟦 Edge AI (On-Device SLM)"]
        EA1["Generate Text"]
        EA2["NLP: Summarization"]
        EA3["NLP: Sentiment Analysis"]
        EA4["Adjust Reading Level"]
    end

    subgraph System ["🟩 System"]
        UC1["Trigger Text Generation"]
        UC2["Configure Tone / Difficulty / Theme"]
        UC3["Send Prompts to Model"]
        UC4["Apply Personalization"]
        UC5["Interact with Dynamic Content"]
    end

    P --> UC1
    P --> UC2
    C --> UC5
    UC1 --> UC3
    UC2 --> UC3
    UC3 --> EA1
    EA1 --> EA2
    EA1 --> EA3
    EA1 --> EA4
    EA4 --> UC4
    UC5 --> UC3
```

### 3.2 System Sequence Diagram

```mermaid
sequenceDiagram
    participant Trigger as 🟩 Trigger\n(Parent / Interaction)
    participant System as 🟩 System
    participant EdgeSLM as 🟦 Edge SLM
    participant NLP as 🟦 NLP Layer
    participant Personalization as 🟦 Personalization Module

    Trigger->>System: Provide prompt
    System->>EdgeSLM: Send prompt
    EdgeSLM-->>System: Raw text output

    System->>NLP: Process output\n(clean, structure)
    NLP-->>System: Structured text

    System->>Personalization: Adjust vocabulary & tone
    Personalization-->>System: Personalized output

    System-->>Trigger: Forward content\nfor display / further processing
```

---

## MODULE 4 — Self-Hosted Media Generation Engine (Cloud GPU)

### 4.1 Use Case Diagram

```mermaid
graph LR
    subgraph Actors
        P(["👤 Parent"])
    end

    subgraph CloudGPU ["🟧 Cloud GPU"]
        CG1["Run Diffusion Model Inference"]
        CG2["Generate Images"]
        CG3["Store Outputs"]
    end

    subgraph System ["🟩 System"]
        UC1["Request Illustration Generation"]
        UC2["Select Style Preferences"]
        UC3["Approve Generated Images"]
        UC4["Queue Generation Jobs"]
        UC5["Track Job Status"]
        UC6["Retrieve Outputs"]
    end

    P --> UC1
    P --> UC2
    P --> UC3
    UC1 --> UC4
    UC4 --> CG1
    CG1 --> CG2
    CG2 --> CG3
    CG3 --> UC6
    UC5 --> UC6
    UC6 --> UC3
```

### 4.2 System Sequence Diagram

```mermaid
sequenceDiagram
    actor Parent
    participant App as 🟩 App Client
    participant Queue as 🟩 Job Queue
    participant GPU as 🟧 Cloud GPU
    participant Storage as 🟧 Storage Service
    participant NotifySvc as 🟩 Notification Service

    Parent->>App: Request illustration generation
    App->>Queue: Create job & enqueue

    Queue->>GPU: Dispatch job
    GPU->>GPU: Load diffusion model\n& run inference
    GPU->>Storage: Store generated images

    Storage-->>NotifySvc: Notify completion
    NotifySvc-->>App: Job complete signal

    App->>Storage: Retrieve images
    App-->>Parent: Display images for review

    Parent->>App: Approve / reject images
    App->>App: Store approved content
```

---

## MODULE 5 — Safety, Guardrails & Real-Time Monitoring

### 5.1 Use Case Diagram

```mermaid
graph LR
    subgraph Actors
        P(["👤 Parent"])
        C(["👦 Child"])
    end

    subgraph EdgeAI ["🟦 Edge AI (SLM)"]
        EA1["Contextual Safety Checks"]
    end

    subgraph System ["🟩 System"]
        UC1["Define Content Restrictions"]
        UC2["Blacklist / Whitelist Topics"]
        UC3["Review Flagged Content"]
        UC4["Interact with Content"]
        UC5["Scan Generated Content"]
        UC6["Monitor Behavior"]
        UC7["Detect Anomalies"]
    end

    P --> UC1
    P --> UC2
    P --> UC3
    C --> UC4
    UC4 --> UC5
    UC5 --> EA1
    EA1 --> UC5
    UC5 --> UC6
    UC6 --> UC7
    UC7 --> UC3
```

### 5.2 System Sequence Diagram

```mermaid
sequenceDiagram
    participant GenEngine as 🟩 Generation Engine
    participant SafetyEng as 🟩 Safety Engine
    participant EdgeSLM as 🟦 Edge SLM
    participant App as 🟩 App Client
    actor Parent

    GenEngine->>SafetyEng: Send generated content\n(text / audio)
    SafetyEng->>SafetyEng: Keyword analysis
    SafetyEng->>EdgeSLM: Contextual analysis
    EdgeSLM-->>SafetyEng: Contextual result

    alt Content is SAFE
        SafetyEng-->>App: ✅ Deliver content to child
    else Content is FLAGGED
        SafetyEng-->>App: 🚫 Block content
        App-->>Parent: Send flagged content for review
        Parent->>App: Approve or reject
        App->>SafetyEng: Update safety feedback loop
    end
```

---

## MODULE 6 — Child UX (Playback, Interaction, Accessibility)

### 6.1 Use Case Diagram

```mermaid
graph LR
    subgraph Actors
        C(["👦 Child"])
    end

    subgraph EdgeAI ["🟦 Edge AI (SLM)"]
        EA1["Generate Dynamic Responses\n(Interactive Mode)"]
    end

    subgraph System ["🟩 System"]
        UC1["Read Stories"]
        UC2["Listen to Narration"]
        UC3["Interact with Story Elements"]
        UC4["Make Choices\n(Branching Narratives)"]
        UC5["Render UI"]
        UC6["Sync Text, Audio & Visuals"]
        UC7["Handle Interactions"]
    end

    C --> UC1
    C --> UC2
    C --> UC3
    C --> UC4
    UC1 --> UC5
    UC2 --> UC6
    UC3 --> UC7
    UC4 --> UC7
    UC7 --> EA1
    EA1 --> UC5
    EA1 --> UC6
```

### 6.2 System Sequence Diagram

```mermaid
sequenceDiagram
    actor Child
    participant App as 🟩 App Client
    participant ContentDB as 🟩 Content Store
    participant AudioSvc as 🟩 Audio Narration
    participant EdgeSLM as 🟦 Edge SLM

    Child->>App: Select story
    App->>ContentDB: Load story content
    ContentDB-->>App: Story data

    App->>App: Render UI\n(text + images)
    App->>AudioSvc: Start audio narration
    AudioSvc-->>App: Narration stream

    loop Story Interaction
        Child->>App: Tap / make choice
        App->>App: Process interaction
        App->>EdgeSLM: Generate continuation\n(if interactive branch)
        EdgeSLM-->>App: Dynamic content
        App->>App: Update UI & audio
    end

    App-->>Child: Story ends / loops
```

---

## MODULE 7 — Data Synchronization & Offline Functionality

### 7.1 Use Case Diagram

```mermaid
graph LR
    subgraph Actors
        P(["👤 Parent"])
        C(["👦 Child"])
    end

    subgraph System ["🟩 System"]
        UC1["Use App Offline"]
        UC2["Trigger Manual Sync"]
        UC3["Access Cached Stories"]
        UC4["Store Local Data"]
        UC5["Sync with Cloud"]
        UC6["Resolve Conflicts"]
    end

    P --> UC1
    P --> UC2
    C --> UC3
    UC1 --> UC4
    UC2 --> UC5
    UC4 --> UC5
    UC5 --> UC6
```

### 7.2 System Sequence Diagram

```mermaid
sequenceDiagram
    actor User
    participant App as 🟩 App Client
    participant LocalDB as 🟩 Local Database
    participant SyncMgr as 🟩 Sync Manager
    participant Cloud as 🟩 Cloud Backend

    User->>App: Perform action (offline)
    App->>LocalDB: Store data locally
    App->>SyncMgr: Queue sync operation

    Note over App,Cloud: Network becomes available

    SyncMgr->>Cloud: Push local changes
    Cloud-->>SyncMgr: Return cloud updates

    SyncMgr->>SyncMgr: Resolve conflicts
    SyncMgr->>LocalDB: Update local DB

    LocalDB-->>App: Trigger UI refresh
    App-->>User: UI reflects synced state
```

---

## MODULE 8 — Analytics, Activity Tracking & Screen Time

### 8.1 Use Case Diagram

```mermaid
graph LR
    subgraph Actors
        P(["👤 Parent"])
        C(["👦 Child"])
    end

    subgraph System ["🟩 System"]
        UC1["Use App\n(Reading / Interacting)"]
        UC2["View Analytics Dashboard"]
        UC3["Set Screen Time Limits"]
        UC4["Track Usage"]
        UC5["Generate Insights"]
        UC6["Enforce Screen Limits"]
    end

    C --> UC1
    P --> UC2
    P --> UC3
    UC1 --> UC4
    UC4 --> UC5
    UC3 --> UC6
    UC5 --> UC2
```

### 8.2 System Sequence Diagram

```mermaid
sequenceDiagram
    actor Child
    participant App as 🟩 App Client
    participant SessionLog as 🟩 Session Logger
    participant ScreenMgr as 🟩 Screen Time Manager
    participant Analytics as 🟩 Analytics Engine
    participant Dashboard as 🟩 Parent Dashboard

    Child->>App: Start session
    App->>SessionLog: Log session start

    loop Active Session
        App->>SessionLog: Track activity events
        App->>ScreenMgr: Check usage vs. limit

        alt Within limit
            ScreenMgr-->>App: ✅ Continue session
        else Limit exceeded
            ScreenMgr-->>App: 🔒 Lock session
            App-->>Child: Session ended — limit reached
        end
    end

    App->>SessionLog: Log session end
    SessionLog->>Analytics: Process session data
    Analytics-->>Dashboard: Update parent dashboard
```

---

## MODULE 9 — Cross-Platform Technical & Performance

### 9.1 Use Case Diagram

```mermaid
graph LR
    subgraph Actors
        D(["📱 Device"])
    end

    subgraph System ["🟩 System"]
        UC1["Detect Device Capabilities"]
        UC2["Adapt UI Layout"]
        UC3["Optimize Performance"]
        UC4["Provide Hardware Constraints"]
        UC5["Load Optimized Assets"]
        UC6["Adjust Runtime Based on Usage"]
    end

    D --> UC4
    UC4 --> UC1
    UC1 --> UC2
    UC1 --> UC3
    UC3 --> UC5
    UC5 --> UC6
```

### 9.2 System Sequence Diagram

```mermaid
sequenceDiagram
    participant Device as 📱 Device
    participant App as 🟩 App Client
    participant PerfMgr as 🟩 Performance Manager
    participant UIEngine as 🟩 UI Engine
    participant AssetSvc as 🟩 Asset Service

    Device->>App: App launch
    App->>Device: Query device specs\n(RAM, CPU, screen, GPU)
    Device-->>App: Hardware profile

    App->>PerfMgr: Set performance config
    PerfMgr-->>UIEngine: Adapt layout for device

    App->>AssetSvc: Load optimized assets\n(resolution, format)
    AssetSvc-->>App: Assets ready

    loop Runtime Monitoring
        App->>PerfMgr: Report usage metrics
        PerfMgr-->>App: Adjust config dynamically
    end

    App-->>Device: Smooth interaction ensured
```

---

## MODULE 10 — Monetization & Subscription Management

### 10.1 Use Case Diagram

```mermaid
graph LR
    subgraph Actors
        P(["👤 Parent"])
    end

    subgraph System ["🟩 System"]
        UC1["Subscribe to Plans"]
        UC2["Upgrade / Downgrade Plan"]
        UC3["Enable / Disable Ads"]
        UC4["Process Payments"]
        UC5["Manage Subscriptions"]
        UC6["Gate Premium Features"]
    end

    P --> UC1
    P --> UC2
    P --> UC3
    UC1 --> UC4
    UC2 --> UC4
    UC4 --> UC5
    UC5 --> UC6
```

### 10.2 System Sequence Diagram

```mermaid
sequenceDiagram
    actor Parent
    participant App as 🟩 App Client
    participant PayGateway as 🟩 Payment Gateway
    participant SubSvc as 🟩 Subscription Service
    participant FeatureMgr as 🟩 Feature Manager

    Parent->>App: Select subscription plan
    App->>PayGateway: Send payment request
    PayGateway->>PayGateway: Process payment
    PayGateway-->>App: Payment confirmed ✅

    App->>SubSvc: Activate subscription plan
    SubSvc->>FeatureMgr: Update feature access
    FeatureMgr-->>App: Premium features unlocked

    App-->>Parent: Confirmation + premium access granted
```

---

## MODULE 11 — Legal, COPPA / GDPR-K Compliance & Privacy

### 11.1 Use Case Diagram

```mermaid
graph LR
    subgraph Actors
        P(["👤 Parent"])
    end

    subgraph System ["🟩 System"]
        UC1["Provide Parental Consent"]
        UC2["Request Data Deletion"]
        UC3["Manage Privacy Settings"]
        UC4["Verify Age Compliance"]
        UC5["Store Consent Securely"]
        UC6["Maintain Audit Logs"]
        UC7["Encrypt Data"]
        UC8["Enforce Compliance Rules"]
    end

    P --> UC1
    P --> UC2
    P --> UC3
    UC1 --> UC4
    UC4 --> UC5
    UC5 --> UC6
    UC6 --> UC8
    UC7 --> UC8
```

### 11.2 System Sequence Diagram

```mermaid
sequenceDiagram
    actor Parent
    participant App as 🟩 App Client
    participant ComplianceSvc as 🟩 Compliance Service
    participant ConsentStore as 🟩 Consent Store
    participant AuditLog as 🟩 Audit Log

    Parent->>App: Create child account
    App->>ComplianceSvc: Check regulatory requirements\n(COPPA / GDPR-K)
    ComplianceSvc-->>App: Consent required

    App-->>Parent: Request parental consent
    Parent->>App: Provide consent

    App->>ConsentStore: Store consent securely\n(encrypted)
    ConsentStore-->>App: Stored ✅

    App->>AuditLog: Log consent action\n(timestamp, user, action)
    AuditLog-->>App: Logged ✅

    App->>App: Activate child account
    App->>ComplianceSvc: Register compliance rules\nfor this account
    ComplianceSvc-->>App: Rules enforced ✅
```

---

## MODULE 12 — DevOps, Deployment & AI Model Lifecycle

### 12.1 Use Case Diagram

```mermaid
graph LR
    subgraph Actors
        D(["🛠️ DevOps Engineer"])
    end

    subgraph EdgeAI ["🟦 Edge AI (SLM)"]
        EA1["Receive OTA Updates"]
        EA2["Install Model Update"]
    end

    subgraph CloudGPU ["🟧 Cloud GPU"]
        CG1["Run Updated Models"]
    end

    subgraph System ["🟩 System"]
        UC1["Deploy Models"]
        UC2["Roll Back Updates"]
        UC3["Monitor Infrastructure"]
        UC4["Package Model Update"]
        UC5["Distribute to Edge Devices"]
        UC6["Monitor Success / Failure"]
    end

    D --> UC1
    D --> UC2
    D --> UC3
    UC1 --> UC4
    UC4 --> UC5
    UC5 --> EA1
    EA1 --> EA2
    UC4 --> CG1
    UC5 --> UC6
    UC6 --> UC2
```

### 12.2 System Sequence Diagram

```mermaid
sequenceDiagram
    actor DevOps as 🛠️ DevOps Engineer
    participant CICD as 🟩 CI/CD Pipeline
    participant UpdateSvc as 🟩 Update Service
    participant EdgeDevice as 🟦 Edge Device (SLM)
    participant GPU as 🟧 Cloud GPU
    participant Monitor as 🟩 Monitoring Service

    DevOps->>CICD: Deploy new model version
    CICD->>UpdateSvc: Package model update

    par Edge Distribution
        UpdateSvc->>EdgeDevice: Push OTA update
        EdgeDevice->>EdgeDevice: Install new model
        EdgeDevice-->>Monitor: Report install result
    and Cloud GPU Update
        UpdateSvc->>GPU: Push updated model
        GPU->>GPU: Load & validate model
        GPU-->>Monitor: Report load result
    end

    Monitor->>Monitor: Evaluate success / failure

    alt Deployment successful
        Monitor-->>DevOps: ✅ Deployment confirmed
    else Deployment failed
        Monitor-->>DevOps: ❌ Failure detected
        DevOps->>CICD: Trigger rollback
        CICD->>UpdateSvc: Restore previous version
        UpdateSvc->>EdgeDevice: Rollback OTA
        UpdateSvc->>GPU: Rollback model
    end
```

---

## Boundary Summary

| Layer | Technology | Modules Involved |
|---|---|---|
| 🟦 **Edge AI (On-Device SLM)** | Lightweight language model (e.g., Phi-3, Gemma 2B) | 2, 3, 5, 6, 7, 12 |
| 🟧 **Cloud GPU (Self-Hosted)** | Diffusion model inference (e.g., SDXL, Flux) | 4, 12 |
| 🟩 **System / Backend** | App services, databases, APIs, sync, analytics | All modules |

> **Note**: All Edge AI operations occur fully on-device with no cloud round-trip. Cloud GPU is invoked only for media generation workloads (Module 4) and updated via DevOps pipelines (Module 12).
