interface WeechatResponse<T> {
  header: Header;
  id: string;
  objects: WeechatObject<T>[];
}

type WeechatObjectTypeId = 'hda' | 'inf';

interface WeechatObject<T> {
  type: WeechatObjectTypeId;
  content: T;
}

interface WeechatInfoList {
  key: string;
  value: string;
}

interface WeechatBuffer {
  id: string;
  _id: number;
  pointers: string[];
  local_variables: Localvariables;
  notify: number;
  number: number;
  full_name: string;
  short_name: string;
  title: string;
  hidden: number;
  type: number;
  last_read_line?: number;
}

interface WeechatHotlist {
  buffer: string;
  count: number[];
}

interface WeechatNicklist {
  color: string;
  group: number;
  level: number;
  name: string;
  pointers: string[];
  prefix: string;
  prefix_color: string;
  visible: number;
  _diff: number;
}

interface Hotlist extends WeechatHotlist {
  message: number;
  privmsg: number;
  highlight: number;
  sum: number;
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

interface WeechatLine {
  id: number;
  pointers: string[];
  prefix_length: number;
  prefix: string;
  displayed: number;
  message: string;
  refresh_needed: number;
  str_time: string;
  date: string;
  tags_count: number;
  date_printed: string;
  tags_array: string[];
  buffer: string;
  highlight: number;
  y: number;
}
