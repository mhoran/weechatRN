interface ApiRelayLine extends Omit<
  WeechatLine,
  'id' | 'tags_array' | 'highlight' | 'displayed'
> {
  id: number;
  tags: string[];
  highlight: boolean;
  displayed: boolean;
}

export interface LineResponse {
  code: number;
  event_name: string;
  buffer_id: number;
  body_type: string;
  body: ApiRelayLine;
}

export interface LinesResponse {
  code: number;
  request: string;
  body_type: string;
  body: ApiRelayLine[];
}

interface ApiRelayNicklist extends Omit<
  WeechatNicklist,
  'id' | 'group' | 'visible'
> {
  id: number;
  visible: boolean;
  parent_group_id: number;
}

export interface NickResponse {
  code: number;
  buffer_id: number;
  event_name: string;
  body_type: string;
  body: ApiRelayNicklist;
}

interface NicklistGroup {
  groups: NicklistGroup[];
  nicks: ApiRelayNicklist[];
}

export interface NicklistResponse {
  code: number;
  buffer_id?: number;
  request?: string;
  body_type: string;
  body: {
    groups: NicklistGroup[];
  };
}

interface ApiRelayBuffer extends Omit<
  WeechatBuffer,
  'id' | 'last_read_line' | 'full_name'
> {
  id: number;
  last_read_line_id: number;
  name: string;
}

export interface BufferResponse {
  code: number;
  request?: string;
  request_id?: string;
  event_name?: string;
  buffer_id?: number;
  body_type: string;
  body: ApiRelayBuffer;
}

export interface BuffersResponse {
  code: number;
  body_type: string;
  body: ApiRelayBuffer[];
}
