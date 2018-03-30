interface WeechatResponse<T> {
  header: Header;
  id: string;
  objects: WeechatObject<T>[];
}

type WeechatObjectTypeId = "hda" | "inf";

interface WeechatObject<T> {
  type: WeechatObjectTypeId;
  content: T;
}

interface WeechatInfoList {
  key: string;
  value: string;
}

interface WeechatBuffer {
  pointers: string[];
  local_variables: Localvariables;
  notify: number;
  number: number;
  full_name: string;
  short_name: string;
  title: string;
  hidden: number;
  type: number;
}

interface Localvariables {
  plugin: string;
  name: string;
  server?: string;
  type?: string;
  charset_modifier?: string;
  channel?: string;
  nick?: string;
  script_input_cb?: string;
  script_name?: string;
  iset_filter?: string;
  iset_search_mode?: string;
  iset_search_value?: string;
  script_close_cb?: string;
  no_log?: string;
}

interface Header {
  length: number;
  compression: number;
}
