[graphify] MultiDiGraph edge-collapse diagnostic
input: <in-memory>
input_stage: provided JSON (normal graph.json is post-build)
effective_directed: <direct-call>
nodes: 969
unverified_code_nodes: 0
raw_edges: 2072
valid_candidate_edges: 2028
missing_endpoint_edges: 0
dangling_endpoint_edges: 25
external_reference_edges: 19
self_loop_edges: 1
exact_duplicate_edges: 0
directed_unique_endpoint_pairs: 2013
directed_same_endpoint_collapsed_edges: 15
undirected_unique_endpoint_pairs: 2013
undirected_same_endpoint_collapsed_edges: 15
same_endpoint_group_count: 15
relation_variant_groups: 6
source_file_variant_groups: 0
source_location_variant_groups: 9
context_variant_groups: 0
post_build_graph_type: Graph
post_build_edges: 2055
producer_suppression_sites: 12
producer_suppression_examples:
  - L1341 seen_ids arity=unknown
  - L1874 seen_ids arity=unknown
  - L1876 seen_doc_refs arity=unknown
  - L2246 seen_ids arity=unknown
  - L2393 seen_ids arity=unknown
  - L3113 seen_keys arity=unknown
  - L3282 seen_keys arity=unknown
  - L5338 seen_ids arity=unknown
examples:
  - app_chatgpt_auth -> ref_next edges=2 relations=['imports_from'] locations=['L1', 'L2'] contexts=['import']
  - components_hero_hero -> components_hero_hero_step edges=2 relations=['calls', 'contains'] locations=['L49', 'L54'] contexts=['', 'call']
  - components_product_rail -> ref_react edges=2 relations=['imports_from'] locations=['L2', 'L3'] contexts=['import']
  - components_product_rail_productrail -> components_product_rail_productrail_scrollto edges=2 relations=['calls', 'contains'] locations=['L41', 'L95'] contexts=['', 'call']
  - components_product_rail_productrail -> components_product_rail_productrail_step edges=2 relations=['calls', 'contains'] locations=['L44', 'L95'] contexts=['', 'call']
note: normal graph.json is post-build; raw producer loss must be measured earlier.