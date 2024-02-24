local QBCore = exports['qb-core']:GetCoreObject()

local DebugMode = Config.Debug

-- Create iteams
for k, item in pairs(Config.RequiredItems) do
  exports['qb-core']:AddItem(
    item.Name,
    {
      name = item.Name,
      label = item.Label,
      weight = item.Weight,
      type = item.Type,
      image = item.Picture,
      unique = item.Unique,
      useable = item.useable,
      shouldClose = item.ShouldClose,
      combinable = item.Combinable,
      description =
          item.Description
    })
end

QBCore.Functions.CreateUseableItem('bloodsamplekit', function(source)
  local Player = QBCore.Functions.GetPlayer(source)
  if not Player or not Player.Functions.GetItemByName('bloodsamplekit') then return end
  TriggerClientEvent('bm-bloodEvidence:client:getBloodSampleFromPlayer', source)
end)

QBCore.Functions.CreateUseableItem('bloodsamplereport', function(source)
  local Player = QBCore.Functions.GetPlayer(source)
  if not Player or not Player.Functions.GetItemByName('bloodsamplereport') then return end
end)

QBCore.Commands.Add(Config.Commands.GetBloodSample, "Get blood sample from closest player", {}, false, function(source)
  TriggerClientEvent('bm-bloodEvidence:client:getBloodSampleFromPlayer', source)
end)


local bloodSampleId = 1
RegisterNetEvent('bm-bloodEvidence:server:main:getBloodSampleFromPlayer', function(targetPlayerId, notes)
  local Player = QBCore.Functions.GetPlayer(source)
  local targetPlayer = QBCore.Functions.GetPlayer(targetPlayerId)
  local bloodId = targetPlayer.PlayerData.metadata
      ['fingerprint'] -- We will use fingerprint now, likely set up a blood system.
  local bloodType = targetPlayer.PlayerData.metadata
      ['bloodtype']   -- We will use fingerprint now, likely set up a blood system.
  -- if DebugMode then print(bloodId) end
  -- if DebugMode then print(bloodType) end
  if Player.Functions.RemoveItem(Config.RequiredItems.BloodSampleKit.Name, 1) then
    local id = bloodSampleId
    bloodSampleId = bloodSampleId + 1
    local info = {
      id = id,
      source = "Sample Kit",
      label = "Blood sample. ID: " .. id .. ". Blood type: " .. bloodType,
      type = 'dna',
      bloodId = bloodId,
      bloodType = bloodType,
      location = "Somewhere",
      datetime = "Sometime",
      quality = "Fresh",
      notes = notes or 'DEFAULT NOTE',
    }
    if not Player.Functions.AddItem(Config.RequiredItems.BloodSample.Name, 1, false, info) then return end
    TriggerClientEvent('inventory:client:ItemBox', source, QBCore.Shared.Items[Config.RequiredItems.BloodSample.Name],
      'add')
  else
    TriggerClientEvent('QBCore:Notify', source, "You do not have the correct item (Panda)", 'error')
  end
  TriggerClientEvent('bm-bloodEvidence:client:main:provideBloodSample', source, bloodId, bloodType)
end)

QBCore.Functions.CreateCallback('bm-bloodEvidence:server:main:giveProcessedSample',
  function(source, cb, slot, bloodId)
    local Player = QBCore.Functions.GetPlayer(source)
    local itemInfo = Player.PlayerData.items[slot].info
    itemInfo.bloodId = bloodId
    itemInfo.processed = true
    if Player.Functions.RemoveItem(Config.RequiredItems.BloodSample.Name, 1, slot) then
      if not Player.Functions.AddItem(Config.RequiredItems.BloodSample.Name, 1, false, itemInfo) then return end
      TriggerClientEvent('inventory:client:ItemBox', source, QBCore.Shared.Items[Config.RequiredItems.BloodSample.Name],
        'remove')
      TriggerClientEvent('inventory:client:ItemBox', source, QBCore.Shared.Items[Config.RequiredItems.BloodSample.Name],
        'add')
    else
      TriggerClientEvent('QBCore:Notify', source, "", 'error')
      cb(false)
      return
    end
    cb(true)
  end)

QBCore.Functions.CreateCallback('bm-bloodEvidence:server:createNewReport',
  function(_, cb, reportToSave)
    local jsonReportToSave = json.encode(reportToSave)
    MySQL.Async.insert("INSERT INTO bm_bloodsamples (report) VALUES (?) ", { { jsonReportToSave } },
      function(id)
        if id then
          cb(200, id)
          return
        end
        cb(404)
      end)
  end)

QBCore.Functions.CreateCallback('bm-bloodEvidence:server:getReport',
  function(_, cb, reportId)
    MySQL.single('SELECT * FROM bm_bloodsamples WHERE id = ? LIMIT 1', { reportId },
      function(result)
        if result then
          cb(200, result)
        end
        cb(404, {})
      end)
  end)

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
