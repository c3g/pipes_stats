import { injectGlobal } from 'styled-components'

/* eslint no-unused-expressions: 0 */
injectGlobal`
html,
body,
#root,
#root>div {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

body {
  margin: 0;
  padding: 0;
  font-family: sans-serif;
}

.is-loading {
  opacity: 0.6;
  pointer-events: none;
}


.Checkbox {
  height: 34px;
  line-height: 34px;
  text-align: left;
}


.MultiSelect {
  display: inline-block;
  /*max-width: 100%;*/
  width: 186px;
}
.MultiSelect-list {
  max-height: 400px;
  overflow-y: auto;
}
.MultiSelect-button {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 30px;
}
.MultiSelect-icon {
  position: absolute;
  top: calc(50% - 5px);
  right: 10px;
}
.MultiSelect-item > i {
    min-width: 20px;
}


.App {
  display: inline-block;
  padding-top: 51px;
  height: 100%;
  width: 100%;
  overflow: hidden;
}
.App-content {
  height: 100%;
  width: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
}


td.key {
  font-weight: bold;
}

.recharts-tooltip-wrapper {
  z-index: 1;
}
.recharts-tooltip-item-list {
  column-count: 2;
}
.recharts-tooltip-item {
  display: flex !important;
  flex-direction: row;
}
.recharts-tooltip-item-name {
}
.recharts-tooltip-item-separator {
  opacity: 0;
  flex: 1;
}
.recharts-tooltip-item-value {
  color: #666;
}

.recharts-legend-item-text {
  font-size: 0.7em;
  text-align: left;
  padding: 0 !important;
}

.chart-popover {
  display: block !important;
  max-width: unset;
}

.square {
  display: inline-block;
  border: 1px solid black;
  width:  0.6em;
  height: 0.6em;
  margin-right: 0.4em;
}
`
// vim: ft=css
