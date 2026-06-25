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
  _id: string;
  pointers: string[];
  local_variables: Localvariables;
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
  id: string;
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

interface Hotlist {
  buffer: string;
  message: number;
  privmsg: number;
  highlight: number;
  sum: number;
}

interface Localvariables {
  type?: string;
}

interface Header {
  length: number;
  compression: number;
}

interface WeechatLine {
  id: number;
  pointers: string[];
  prefix: string;
  displayed: number;
  message: string;
  date: string;
  date_printed: string;
  tags_array: string[];
  buffer: string;
  highlight: number;
  notify_level?: number;
}
