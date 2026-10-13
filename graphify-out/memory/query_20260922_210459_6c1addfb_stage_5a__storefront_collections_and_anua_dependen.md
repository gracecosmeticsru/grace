---
type: "query"
date: "2026-09-22T21:04:59.270383+00:00"
question: "Stage 5A: storefront collections and Anua dependencies"
contributor: "graphify"
outcome: "useful"
source_nodes: ["Storefront()", "ProductRail()", "getCollection()"]
---

# Q: Stage 5A: storefront collections and Anua dependencies

## Answer

Expanded from actual graph vocabulary: storefront brand focus collection product rail. Storefront uses shared ProductRail; collection routes resolve through getCollection/selectCollection. Stage5A adds graceCollections with 24 exact pairs; existing top collectionMeta stays unchanged. Source truth for completion: docs/STAGE-05A-REVIEW.md and RESUME.md. Code graph updated after edits; no catalogue or shared card changes.

## Outcome

- Signal: useful

## Source Nodes

- Storefront()
- ProductRail()
- getCollection()