# SEO Customization, Backup Utility, & Submission Settings

This project introduces a comprehensive administration system featuring dynamic SEO management for group pages, a full backup utility, and configurable submission constraints, all supported by persistent external object storage for images.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed based on user feedback.

- **Storage**: Migrate from local ephemeral storage to external object storage (e.g., Cloudflare R2) mapped to `images.grouplinks.app` for reliable persistence.
- **Config Location**: SEO templates, the Site Title, and the "Minimum Description Word Count" for submissions will be managed via a new "Admin Settings" section in the Admin Dashboard.
- **Granularity & Scope**: SEO templates will apply **exclusively to group detail pages**.
- **Template Variables**: Supported variables include: `(Group Title)`, `(Group Category)`, `(Group Tags)`, `(Site Title)`, `(Group Platform)`, `(Group Description)`.
- **Backup/Restore**:
  - **Backup**: Generate a downloadable archive containing database dump and all images (fetched from object storage).
  - **Restore**: Upload endpoint to process the archive, restore DB records, and re-upload images to object storage.
- **Image Processing**: All images (user-submitted or scraped) must be converted to WebP and compressed under 10KB.

## 1. Overview & Core Concept

- **What It Does**: Provides administrators with dynamic control over SEO templates, enforces content quality via submission constraints, and ensures data sovereignty through a full, cloud-backed backup/restore utility.
- **Key Value**: Persistent image assets across redeployments, improved SEO performance, higher content quality, and secure data management.

## 2. Technical Architecture

```
[ Admin Dashboard UI ] 
      |
      +---> [/api/admin/settings] -> [ SEO & Submission Config (DB) ]
      |
      +---> [/api/admin/backup]   -> [ Backup Archiver Script ]
      |                                  |
      |                                  +--> [ DB Dump ]
      |                                  +--> [ Download images from R2 ]
      |                                  +--> [ .zip Bundle Download ]
      |
      +---> [/api/admin/restore] -> [ Restore Processor ]
                                         |
                                         +--> [ Process DB Dump ]
                                         +--> [ Upload images to R2 ]
```

### Data Strategy
- **Image Pipeline**: `[Submission/Scraper]` -> `[Sharp Compression/Resize (WebP, <10KB)]` -> `[Upload to R2]` -> `[Store R2 URL in DB]`.
- **Backup**:
    1.  Serialize the `groups` table to a SQL dump file.
    2.  For each group, download image from R2 URL.
    3.  Bundle dump + images into an archive.
- **Restore**:
    1.  Extract archive.
    2.  Import SQL dump.
    3.  Upload images to R2, update group image URLs in DB.

## 3. Key Sequences

- **SEO Resolution**: 
  - `page.tsx` calls `SEOManager.resolveDetail(groupData, siteConfig)`.
  - `SEOManager` replaces tags `(Group Title)`, etc., with values.
- **Submission Validation**:
  - `POST /api/groups` fetches `minDescriptionWords` from DB.
  - Returns `400` if description length < threshold.
- **Image Processing**:
  - Use `sharp` to process: `.webp()`, `.resize({ width: 200, height: 200, fit: 'cover' })`, `.toBuffer()`, ensure file size < 10KB.
