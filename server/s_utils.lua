local lastID = ""
local isAssigning = false

function GetNextID ()
  local prefix = 1
  local time = os.time()
  local nextID = tostring(time) .. tostring(prefix)
  while isAssigning do
    Wait(1)
  end
  isAssigning = true
  while nextID == lastID do
    prefix = prefix + 1
    nextID = tostring(time) .. tostring(prefix)
  end
  lastID = nextID
  isAssigning = false
  return nextID
end

function GetDateTime()
  local month_abbr = {
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  }
  local current_time = os.date("*t")
  local year = current_time.year
  local month = current_time.month
  local day = current_time.day
  local hour = current_time.hour
  local min = current_time.min
  local sec = current_time.sec
  local dateTimeString = string.format("%02d-%s-%02d %02d:%02d:%02d", day, month_abbr[month], year, hour, min, sec)
  return dateTimeString
end

function Tprint(tbl, indent)
  if not indent then indent = 0 end
  for k, v in pairs(tbl) do
    local formatting = string.rep("  ", indent) .. k .. ": "
    if type(v) == "table" then
      print(formatting)
      Tprint(v, indent + 1)
    elseif type(v) == 'boolean' then
      print(formatting .. tostring(v))
    else
      print(formatting .. v)
    end
  end
end
