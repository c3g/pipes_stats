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
body::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  background-color: white;
  width: 100%;
  height: 100%;
  z-index: 1500;
  pointer-events: none;
  opacity: 0;
  transition: all .5s linear;
}
body.loading::after {
  opacity: 1;
}

.is-loading {
  opacity: 0.6;
  pointer-events: none;
}

.monospace {
  font-family: 'Menlo', 'dejavu sans mono', 'Consolas', 'Lucida Console', monospace;
  font-size: 0.9em;
}

.Checkbox {
  height: 34px;
  line-height: 34px;
  text-align: left;
}

.Icon {
  margin-right: 0.5em;
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
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 30px;
  text-align: left;
}
.MultiSelect-icon {
  position: absolute;
  top: calc(50% - 7px);
  right: 10px;
}
.MultiSelect-item > i {
    min-width: 20px;
}

.DatePicker.input-group {
  width: 186px;
}
.DatePicker td {
  border-radius: 5px !important;
}
.DatePicker td.text-muted {
  opacity: 0.6;
}
.DatePicker td:not(.text-muted):not(.bg-primary):hover {
  background-color: #eee;
}


.App {
  display: inline-block;
  padding-top: 51px;
  height: 100%;
  width: 100%;
  overflow: hidden;
}
.App-title {
  font-weight: bold;
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
  max-height: 400px;
  background-color: rgba(255, 255, 255, 0.6);
  border: 1px solid #ddd;
  border-radius: 5px;
}
.chart-popover .label {
  display: none;
}
.chart-popover .intro {
  padding: 0.5em 0;
  font-weight: bold;
}
.chart-popover .desc {
  padding: 0 1em;
}
.chart-popover ul {
  text-align: left;
  height: 100%;
  list-style: none;
  padding: 0;
  column-count: 3;
  column-width: 250px;
}
.chart-popover .item {
  padding: 0 0 0 1em;
}
.chart-popover .item.active {
  font-weight: bold;
}
.chart-popover .item .value {
  opacity: 0.6;
  float: right;
}
.chart-popover .item .color {
  display: inline-block;
  width:  0.6em;
  height: 0.6em;
  margin-right: 0.4em;
  border-radius: 5px;
}


`
// vim: ft=css
