# MailSpec

An interactive browser-based tool for defining, validating, and sharing the physical and postal attributes of direct mail pieces. Built for project managers who need fast, accurate specifications when managing mail pieces intended for processing through the US Postal Service.

---

## Purpose

Direct mail project management requires precise knowledge of piece attributes -- dimensions, weight, paper stock, fold type, postage class, automation compatibility, and more. These details affect everything from design feasibility to postal qualification and cost. MailSpec puts that specification process into a single, focused tool that guides users through the relevant attributes, flags potential issues, and produces clean output suitable for internal planning or vendor communication.

## Who It's For

- Project managers in direct mail production environments
- Print and mail operations teams coordinating with USPS requirements
- Anyone who needs to define or communicate the physical and postal characteristics of a mail piece

## Planned Features

### Core Specification Builder
- Guided input for piece attributes: dimensions, weight, paper stock, coating, fold type, window/no-window, enclosures
- Support for major mail piece types: letters, flats, postcards, self-mailers
- Real-time validation against USPS physical standards (thickness, aspect ratio, flexibility, tab/seal requirements)

### Postal Classification
- Mail class selection (First-Class, Marketing Mail, Nonprofit, etc.)
- Processing category determination (automation, machinable, nonmachinable)
- Postage-relevant attribute flagging (nonstandard surcharges, letter/flat threshold, etc.)

### Output and Sharing
- Clean, printable specification summary
- Export to PDF or clipboard for use in emails, job tickets, or vendor instructions
- Shareable URL or saved spec (stretch goal)

### Reference and Education
- Inline guidance explaining why each attribute matters
- USPS standards reference (DMM-based) integrated into the workflow
- Common pitfall alerts (e.g., a self-mailer that's too rigid, a letter that exceeds aspect ratio)

## Technical Architecture

### Stack
- **HTML / CSS / JavaScript** -- single-page browser application, no build system required
- **React 18** via CDN (Babel in-browser transpilation)
- **Tailwind CSS** via CDN for styling
- Designed to run entirely client-side with no backend dependency

### Project Structure (Planned)
```
mailspec/
  index.html          # Entry point, CDN imports
  app/
    App.jsx           # Root component
    components/       # UI components (form sections, validation, output)
    data/             # USPS standards, piece type definitions, postal rules
    utils/            # Validation logic, calculations
  assets/
    styles.css        # Custom styles beyond Tailwind
  README.md
```

### Design Principles
- **Function first, polish later.** Get the logic and data model right before investing in visual refinement.
- **No build tooling.** Runs directly in the browser via CDN, keeping the development loop fast and the deployment simple.
- **Data-driven.** USPS specifications and postal rules live in structured data files, not hard-coded into components, making updates straightforward as postal standards change.
- **Progressive disclosure.** Show users what they need at each step without overwhelming them with every possible attribute upfront.

## Development

### Local Development
1. Clone the repository
2. Open `index.html` in a browser
3. Edit and refresh (Cmd+Shift+R for hard refresh)

### Deployment
Hosted via GitHub Pages from the `main` branch.

### Development Workflow
This project is developed collaboratively using Claude Code. Complex changes are written as prompt files; simple fixes are entered directly. Testing is done with hard-refresh browser cycles.

## Status

**Phase 0 -- Planning.** The project is in the definition stage. This README represents the initial scope and architectural intent. Development has not yet begun.

## License

TBD

## Author

Dave Zobott
