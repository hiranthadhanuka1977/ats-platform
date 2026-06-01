# Portfolio — Information architecture

Visual navigation maps for TalentHub apps.

| Document | App | Format |
|----------|-----|--------|
| [backoffice-navigation-map.md](./backoffice-navigation-map.md) | Backoffice `:3001` | Site map + cross-links + Mermaid |
| [backoffice-navigation-map.png](./backoffice-navigation-map.png) | Backoffice | PNG export (regenerate from `.mmd`) |

## Regenerate PNG

From repo root:

```bash
npx @mermaid-js/mermaid-cli -i portfolio/information-architecture/backoffice-navigation-map.mmd -o portfolio/information-architecture/backoffice-navigation-map.png -b white -w 2800
```

## Related

- [Platform IA (all apps)](../product-designer-ats-backoffice/04-information-architecture.md)
- [Screen inventory](../product-designer-ats-backoffice/14-screen-and-route-inventory.md)
