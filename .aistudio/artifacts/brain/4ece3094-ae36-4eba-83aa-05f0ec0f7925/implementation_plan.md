# SEO Customization, Backup Utility, & Submission Settings

This project introduces a comprehensive administration system featuring dynamic SEO management for group pages, a full backup utility, and configurable submission constraints.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed based on user feedback.

- **Config Location**: SEO templates, the Site Title, and the "Minimum Description Word Count" for submissions will be managed via a new "Admin Settings" section in the Admin Dashboard.
- **Granularity & Scope**: SEO templates will apply **exclusively to group detail pages**.
- **Template Variables**: Supported variables include: `(Group Title)`, `(Group Category)`, `(Group Tags)`, `(Site Title)`, `(Group Platform)`, `(Group Description)`.
- **Backup Utility**: A downloadable bundle script will be provided in the Admin Dashboard to archive all group data and image assets into a single downloadable file.
- **Submission Constraint**: Administrators can define a minimum number of words for user-submitted group descriptions.

## 1. Overview & Core Concept

- **What It Does**: Provides administrators with dynamic control over SEO templates, enforces content quality via submission constraints, and ensures data sovereignty through a full backup capability.
- **Key Value**: Improved SEO performance, higher content quality, and secure data management.

## 2. User Experience & Visual Design

### Key User Flows

1.  **Admin Management**: Admin navigates to `/admin/settings` (consolidated) to update:
    - Site Title.
    - SEO Detail Page Templates.
    - Minimum Description Word Count.
2.  **Backup**: Admin navigates to `/admin/backup`, clicks "Generate Full Backup", which triggers the creation of an archive (`.zip` or `.tar.gz`) containing the database dump and all user-uploaded/scraped images, then initiates a browser download.

### Visual Identity & Theme

- **Aesthetic**: Utilitarian SaaS Admin Dashboard, consistent with the existing theme.
- **Layout**: Clean tables and input sections with clear labels and immediate validation feedback.

## 3. Key Product Decisions & Trade-Offs

- **SEO Template Engine**:
    - *Chosen Approach*: Server-side variable substitution specifically for group pages.
    - *Why*: Ensures Google crawlers receive rendered meta-tags immediately upon request.
- **Backup Strategy**:
    - *Chosen Approach*: Downloadable `.zip` archive generated on-the-fly.
    - *Why*: Simplest secure data extraction method for the user.
- **Submission Validation**:
    - *Chosen Approach*: Server-side validation during `POST /api/groups`.
    - *Why*: Robust enforcement of content quality policies.

## 4. Technical Architecture

```
[ Admin Dashboard UI ] 
      |
      +---> [/api/admin/settings] -> [ SEO & Submission Config (DB) ]
      |                                  |
      |                               [ Group Detail Page Renderer ]
      |                                  |
      |                               [ SEOManager Service (Variable Parsing) ]
      |                               |
      |                               [ Submission Validation Service ]
      |
      +---> [/api/admin/backup]   -> [ Backup Archiver Script ]
                                         |
                                         +--> [ DB Dump ]
                                         |
                                         +--> [ /public/image/ upload storage ]
                                         |
                                         +--> [ .zip Bundle Download ]
```

### Data Strategy
- **Settings Config**: Store `siteTitle`, `detailTitleTemplate`, `detailDescriptionTemplate`, and `minDescriptionWords` in a configuration table.
- **Backup**:
    1.  Serialize the `groups_dir` table to a JSON/SQL dump file.
    2.  Bundle dump + `/public/image` directory into an archive.
    3.  Stream the buffer for download.

### Key Sequences
- **SEO Resolution**: 
  - `page.tsx` calls `SEOManager.resolveDetail(groupData, siteConfig)`.
  - `SEOManager` replaces tags `(Group Title)`, `(Group Category)`, `(Group Tags)`, `(Site Title)`, `(Group Platform)`, `(Group Description)` with actual values.
- **Submission Validation**:
  - `POST /api/groups` fetches `minDescriptionWords` from DB.
  - Compares `body.description.split(' ').length` against `minDescriptionWords`.
  - Returns `400 Bad Request` if length < threshold.
