import React from 'react'
import { Button, FormControl, InputGroup, Overlay, Popover } from 'react-bootstrap'

let instanceCount = 0

function CalendarHeader({ previousButtonElement, nextButtonElement, displayDate, minDate, maxDate, onChange, monthLabels }) {
  const isMinMonth = minDate
    ? new Date(minDate).getFullYear() === displayDate.getFullYear() && new Date(minDate).getMonth() === displayDate.getMonth()
    : false
  const isMaxMonth = maxDate
    ? new Date(maxDate).getFullYear() === displayDate.getFullYear() && new Date(maxDate).getMonth() === displayDate.getMonth()
    : false

  const handlePrevious = () => {
    const d = new Date(displayDate)
    d.setDate(1)
    d.setMonth(d.getMonth() - 1)
    onChange(d)
  }
  const handleNext = () => {
    const d = new Date(displayDate)
    d.setDate(1)
    d.setMonth(d.getMonth() + 1)
    onChange(d)
  }

  return (
    <div className="text-center">
      <div className="text-muted float-start" onClick={handlePrevious} style={{ cursor: 'pointer' }}>
        {isMinMonth ? null : previousButtonElement}
      </div>
      <span>{monthLabels[displayDate.getMonth()]} {displayDate.getFullYear()}</span>
      <div className="text-muted float-end" onClick={handleNext} style={{ cursor: 'pointer' }}>
        {isMaxMonth ? null : nextButtonElement}
      </div>
    </div>
  )
}

const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

function setTimeToNoon(date) {
  const d = new Date(date)
  d.setHours(12, 0, 0, 0)
  return d
}

function getWeekNumber(date) {
  const target = new Date(date.valueOf())
  const dayNr = (date.getDay() + 6) % 7
  target.setDate(target.getDate() - dayNr + 3)
  const firstThursday = target.valueOf()
  target.setMonth(0, 1)
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7)
  }
  return 1 + Math.ceil((firstThursday - target) / 604800000)
}

function Calendar({ selectedDate, displayDate, onChange, dayLabels, cellPadding, weekStartsOn, showTodayButton, todayButtonLabel, minDate, maxDate, roundedCorners, showWeeks }) {
  const currentDate = setTimeToNoon(new Date())
  const selDate = selectedDate ? setTimeToNoon(new Date(selectedDate)) : null
  const minD = minDate ? setTimeToNoon(new Date(minDate)) : null
  const maxD = maxDate ? setTimeToNoon(new Date(maxDate)) : null
  const year = displayDate.getFullYear()
  const month = displayDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const startingDay = weekStartsOn > 1
    ? firstDay.getDay() - weekStartsOn + 7
    : weekStartsOn === 1
      ? (firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1)
      : firstDay.getDay()

  let monthLength = daysInMonth[month]
  if (month === 1 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) {
    monthLength = 29
  }

  const handleClick = (day) => {
    const newDate = setTimeToNoon(new Date(displayDate))
    newDate.setDate(day)
    onChange(newDate)
  }

  const handleToday = () => onChange(setTimeToNoon(new Date()))

  const weeks = []
  let day = 1
  for (let i = 0; i < 9; i++) {
    const week = []
    for (let j = 0; j <= 6; j++) {
      if (day <= monthLength && (i > 0 || j >= startingDay)) {
        const date = new Date(year, month, day, 12, 0, 0, 0).toISOString()
        const beforeMin = minD && Date.parse(date) < Date.parse(minD)
        const afterMax = maxD && Date.parse(date) > Date.parse(maxD)
        const style = { cursor: 'pointer', padding: cellPadding, borderRadius: roundedCorners ? 5 : 0 }
        let className = null
        const d = day

        if (beforeMin || afterMax) {
          className = 'text-muted'
          style.cursor = 'default'
          week.push(<td key={j} style={style} className={className}>{day}</td>)
        } else if (selDate && Date.parse(date) === Date.parse(selDate)) {
          className = 'bg-primary text-white'
          week.push(<td key={j} data-day={day} onClick={() => handleClick(d)} style={style} className={className}>{day}</td>)
        } else if (Date.parse(date) === Date.parse(currentDate)) {
          className = 'text-primary'
          week.push(<td key={j} data-day={day} onClick={() => handleClick(d)} style={style} className={className}>{day}</td>)
        } else {
          week.push(<td key={j} data-day={day} onClick={() => handleClick(d)} style={style}>{day}</td>)
        }
        day++
      } else {
        week.push(<td key={j} />)
      }
    }

    if (showWeeks) {
      const weekNum = getWeekNumber(new Date(year, month, day - 1, 12, 0, 0, 0))
      week.unshift(
        <td key={7} style={{ padding: cellPadding, fontSize: '0.8em', color: 'darkgrey' }} className="text-muted">
          {weekNum}
        </td>
      )
    }

    weeks.push(<tr key={i}>{week}</tr>)
    if (day > monthLength) break
  }

  const weekColumn = showWeeks ? <td className="text-muted" style={{ padding: cellPadding }} /> : null

  return (
    <table className="text-center">
      <thead>
        <tr>
          {weekColumn}
          {dayLabels.map((label) => (
            <td key={label} className="text-muted" style={{ padding: cellPadding }}>
              <small>{label}</small>
            </td>
          ))}
        </tr>
      </thead>
      <tbody>{weeks}</tbody>
      {showTodayButton && (
        <tfoot>
          <tr>
            <td colSpan={dayLabels.length} style={{ paddingTop: '9px' }}>
              <Button size="sm" className="w-100 u-today-button" onClick={handleToday}>
                {todayButtonLabel}
              </Button>
            </td>
          </tr>
        </tfoot>
      )}
    </table>
  )
}

export default class DatePicker extends React.Component {
  static defaultProps = {
    cellPadding: '5px',
    dayLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    monthLabels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    clearButtonElement: '×',
    previousButtonElement: '<',
    nextButtonElement: '>',
    calendarPlacement: 'bottom',
    dateFormat: (() => {
      const lang = typeof window !== 'undefined' && window.navigator
        ? (window.navigator.userLanguage || window.navigator.language || '').toLowerCase()
        : ''
      return !lang || lang === 'en-us' ? 'MM/DD/YYYY' : 'DD/MM/YYYY'
    })(),
    showClearButton: true,
    autoFocus: false,
    disabled: false,
    showTodayButton: false,
    todayButtonLabel: 'Today',
    autoComplete: 'on',
    showWeeks: false,
    style: {},
    roundedCorners: false,
    noValidate: false,
  }

  constructor(props) {
    super(props)
    if (props.value && props.defaultValue) {
      throw new Error("Conflicting DatePicker properties 'value' and 'defaultValue'")
    }

    this.instanceId = instanceCount++
    this.inputRef = React.createRef()
    this.hiddenInputRef = React.createRef()
    this.overlayContainerRef = React.createRef()

    let dayLabels
    if (props.weekStartsOn > 1) {
      dayLabels = props.dayLabels.slice(props.weekStartsOn).concat(props.dayLabels.slice(0, props.weekStartsOn))
    } else if (props.weekStartsOn === 1) {
      dayLabels = props.dayLabels.slice(1).concat(props.dayLabels.slice(0, 1))
    } else {
      dayLabels = props.dayLabels
    }

    this.state = {
      ...this.makeDateValues(props.value || props.defaultValue),
      focused: false,
      inputFocused: false,
      placeholder: props.placeholder || props.dateFormat,
      separator: props.dateFormat.match(/[^A-Z]/)[0],
      dayLabels,
    }
  }

  componentDidUpdate(prevProps) {
    const { value } = this.props
    if (this.getValue() !== value && prevProps.value !== value) {
      this.setState(this.makeDateValues(value))
    }
  }

  makeDateValues(isoString) {
    const minDate = this.props.minDate ? new Date(`${this.props.minDate.slice(0,10)}T12:00:00.000Z`) : null
    const maxDate = this.props.maxDate ? new Date(`${this.props.maxDate.slice(0,10)}T12:00:00.000Z`) : null
    const selectedDate = isoString ? new Date(`${isoString.slice(0,10)}T12:00:00.000Z`) : null
    const inputValue = selectedDate ? this.makeInputValueString(selectedDate) : null

    let displayDate
    if (selectedDate) {
      displayDate = new Date(selectedDate)
    } else {
      const today = new Date(`${new Date().toISOString().slice(0,10)}T12:00:00.000Z`)
      if (minDate && Date.parse(minDate) >= Date.parse(today)) {
        displayDate = minDate
      } else if (maxDate && Date.parse(maxDate) <= Date.parse(today)) {
        displayDate = maxDate
      } else {
        displayDate = today
      }
    }

    return { value: selectedDate ? selectedDate.toISOString() : null, displayDate, selectedDate, inputValue }
  }

  getValue() {
    return this.state.selectedDate ? this.state.selectedDate.toISOString() : null
  }

  makeInputValueString(date) {
    const month = date.getMonth() + 1
    const day = date.getDate()
    const sep = this.state ? this.state.separator : this.props.dateFormat.match(/[^A-Z]/)[0]
    const mm = month > 9 ? month : `0${month}`
    const dd = day > 9 ? day : `0${day}`
    if (this.props.dateFormat.match(/MM.DD.YYYY/)) return `${mm}${sep}${dd}${sep}${date.getFullYear()}`
    if (this.props.dateFormat.match(/DD.MM.YYYY/)) return `${dd}${sep}${mm}${sep}${date.getFullYear()}`
    return `${date.getFullYear()}${sep}${mm}${sep}${dd}`
  }

  getCalendarPlacement() {
    const { calendarPlacement } = this.props
    return typeof calendarPlacement === 'function' ? calendarPlacement() : calendarPlacement
  }

  clear() {
    if (this.props.onClear) this.props.onClear()
    else this.setState(this.makeDateValues(null))
    if (this.props.onChange) this.props.onChange(null, null)
  }

  handleHide = () => {
    if (this.state.inputFocused) return
    this.setState({ focused: false })
    if (this.props.onBlur) {
      const event = document.createEvent('CustomEvent')
      event.initEvent('Change Date', true, false)
      this.hiddenInputRef.current && this.hiddenInputRef.current.dispatchEvent(event)
      this.props.onBlur(event)
    }
  }

  handleKeyDown = (e) => {
    if (e.which === 9 && this.state.inputFocused) {
      this.setState({ focused: false })
      if (this.props.onBlur) {
        const event = document.createEvent('CustomEvent')
        event.initEvent('Change Date', true, false)
        this.hiddenInputRef.current && this.hiddenInputRef.current.dispatchEvent(event)
        this.props.onBlur(event)
      }
    }
  }

  handleFocus = () => {
    if (this.state.focused) return
    this.setState({ inputFocused: true, focused: true, calendarPlacement: this.getCalendarPlacement() })
    if (this.props.onFocus) {
      const event = document.createEvent('CustomEvent')
      event.initEvent('Change Date', true, false)
      this.hiddenInputRef.current && this.hiddenInputRef.current.dispatchEvent(event)
      this.props.onFocus(event)
    }
  }

  handleBlur = () => {
    this.setState({ inputFocused: false })
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !(this.state.inputFocused === true && nextState.inputFocused === false)
  }

  handleBadInput(originalValue) {
    const { separator } = this.state
    const parts = originalValue.replace(new RegExp(`[^0-9${separator}]`), '').split(separator)
    if (this.props.dateFormat.match(/MM.DD.YYYY/) || this.props.dateFormat.match(/DD.MM.YYYY/)) {
      if (parts[0] && parts[0].length > 2) { parts[1] = parts[0].slice(2) + (parts[1] || ''); parts[0] = parts[0].slice(0, 2) }
      if (parts[1] && parts[1].length > 2) { parts[2] = parts[1].slice(2) + (parts[2] || ''); parts[1] = parts[1].slice(0, 2) }
      if (parts[2]) parts[2] = parts[2].slice(0, 4)
    } else {
      if (parts[0] && parts[0].length > 4) { parts[1] = parts[0].slice(4) + (parts[1] || ''); parts[0] = parts[0].slice(0, 4) }
      if (parts[1] && parts[1].length > 2) { parts[2] = parts[1].slice(2) + (parts[2] || ''); parts[1] = parts[1].slice(0, 2) }
      if (parts[2]) parts[2] = parts[2].slice(0, 2)
    }
    this.setState({ inputValue: parts.join(separator) })
  }

  handleInputChange = () => {
    const { separator } = this.state
    const originalValue = this.inputRef.current ? this.inputRef.current.value : ''
    const inputValue = originalValue.replace(/(-|\/\/)/g, separator).slice(0, 10)
    if (!inputValue) { this.clear(); return }

    let month
    let day
    let year
    if (this.props.dateFormat.match(/MM.DD.YYYY/)) {
      if (!inputValue.match(/[0-1][0-9].[0-3][0-9].[1-2][0-9][0-9][0-9]/)) { this.handleBadInput(originalValue); return }
      month = inputValue.slice(0,2).replace(/[^0-9]/g, '')
      day   = inputValue.slice(3,5).replace(/[^0-9]/g, '')
      year  = inputValue.slice(6,10).replace(/[^0-9]/g, '')
    } else if (this.props.dateFormat.match(/DD.MM.YYYY/)) {
      if (!inputValue.match(/[0-3][0-9].[0-1][0-9].[1-2][0-9][0-9][0-9]/)) { this.handleBadInput(originalValue); return }
      day   = inputValue.slice(0,2).replace(/[^0-9]/g, '')
      month = inputValue.slice(3,5).replace(/[^0-9]/g, '')
      year  = inputValue.slice(6,10).replace(/[^0-9]/g, '')
    } else {
      if (!inputValue.match(/[1-2][0-9][0-9][0-9].[0-1][0-9].[0-3][0-9]/)) { this.handleBadInput(originalValue); return }
      year  = inputValue.slice(0,4).replace(/[^0-9]/g, '')
      month = inputValue.slice(5,7).replace(/[^0-9]/g, '')
      day   = inputValue.slice(8,10).replace(/[^0-9]/g, '')
    }

    const mi = parseInt(month, 10)
    const di = parseInt(day, 10)
    const yi = parseInt(year, 10)
    if (mi > 12 || di > 31) { this.handleBadInput(originalValue); return }

    if (!Number.isNaN(mi) && !Number.isNaN(di) && !Number.isNaN(yi) && mi <= 12 && di <= 31 && yi > 999) {
      const selectedDate = new Date(yi, mi - 1, di, 12, 0, 0, 0)
      this.setState({ selectedDate, displayDate: selectedDate, value: selectedDate.toISOString() })
      if (this.props.onChange) this.props.onChange(selectedDate.toISOString(), inputValue)
    }
    this.setState({ inputValue })
  }

  onChangeMonth = (newDisplayDate) => {
    this.setState({ displayDate: newDisplayDate })
  }

  onChangeDate = (newSelectedDate) => {
    const inputValue = this.makeInputValueString(newSelectedDate)
    this.setState({ inputValue, selectedDate: newSelectedDate, displayDate: newSelectedDate, value: newSelectedDate.toISOString(), focused: false })
    if (this.props.onBlur) {
      const event = document.createEvent('CustomEvent')
      event.initEvent('Change Date', true, false)
      this.hiddenInputRef.current && this.hiddenInputRef.current.dispatchEvent(event)
      this.props.onBlur(event)
    }
    if (this.props.onChange) this.props.onChange(newSelectedDate.toISOString(), inputValue)
  }

  render() {
    const { previousButtonElement, nextButtonElement, monthLabels, cellPadding, weekStartsOn, showTodayButton, todayButtonLabel, minDate, maxDate, roundedCorners, showWeeks, showClearButton, clearButtonElement, disabled, id, name, required, className, style, autoFocus, autoComplete, onInvalid, bsSize, addonBefore, children } = this.props

    const calendarHeader = (
      <CalendarHeader
        previousButtonElement={previousButtonElement}
        nextButtonElement={nextButtonElement}
        displayDate={this.state.displayDate}
        minDate={minDate}
        maxDate={maxDate}
        onChange={this.onChangeMonth}
        monthLabels={monthLabels}
      />
    )

    return (
      <InputGroup size={bsSize} className='DatePicker' id={id ? `${id}_group` : null}>
        {addonBefore}
        <div ref={this.overlayContainerRef} style={{ position: 'absolute', width: 0, height: 0 }} />
        <Overlay
          rootClose
          onHide={this.handleHide}
          show={this.state.focused}
          container={this.overlayContainerRef}
          target={this.inputRef}
          placement={this.state.calendarPlacement || 'bottom'}
        >
          <Popover id={`date-picker-popover-${this.instanceId}`}>
            <Popover.Header>{calendarHeader}</Popover.Header>
            <Popover.Body>
              <Calendar
                cellPadding={cellPadding}
                selectedDate={this.state.selectedDate}
                displayDate={this.state.displayDate}
                onChange={this.onChangeDate}
                dayLabels={this.state.dayLabels}
                weekStartsOn={weekStartsOn}
                showTodayButton={showTodayButton}
                todayButtonLabel={todayButtonLabel}
                minDate={minDate}
                maxDate={maxDate}
                roundedCorners={roundedCorners}
                showWeeks={showWeeks}
              />
            </Popover.Body>
          </Popover>
        </Overlay>
        <input
          ref={this.hiddenInputRef}
          type="hidden"
          id={id}
          name={name}
          value={this.state.value || ''}
          data-formattedvalue={this.state.value ? this.state.inputValue : ''}
        />
        <FormControl
          ref={this.inputRef}
          onKeyDown={this.handleKeyDown}
          value={this.state.inputValue || ''}
          required={required}
          type="text"
          className={className}
          style={style}
          autoFocus={autoFocus}
          disabled={disabled}
          placeholder={this.state.focused ? this.props.dateFormat : this.state.placeholder}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          onChange={this.handleInputChange}
          autoComplete={autoComplete}
          onInvalid={onInvalid}
        />
        {showClearButton && (
          <InputGroup.Text
            onClick={disabled ? null : () => this.clear()}
            style={{ cursor: (this.state.inputValue && !disabled) ? 'pointer' : 'not-allowed' }}
          >
            <div style={{ opacity: (this.state.inputValue && !disabled) ? 1 : 0.5 }}>
              {clearButtonElement}
            </div>
          </InputGroup.Text>
        )}
        {children}
      </InputGroup>
    )
  }
}
