Config = Config or {

  Commands = {                         -- Config to change commands incase of any conflicts.
    GetBloodSample = "getbloodsample", -- Get blood sample from closest player.
  },

  Locations = {
    Analysiers = {
      vector3(442.1, -978.82, 30.69)
    }
  },

  Debug = true,     -- Turn debug mode on (true/false)

  RequiredItems = { -- These are here incase you needed to save the items under a different name.
    BloodSampleKit = {
      Name = 'bloodsamplekit',
      Label = 'Blood sample kit',
      Picture = '',
      Weight = 200,
      Type = 'item',
      Useable = true,
      ShouldClose = true,
      Unique = false,
      Combinable = false,
      Description = 'Unsued blood sample kit'
    },
    BloodSample = { -- Item required to take blood sample from player.
      Name = 'bloodsample',
      Label = 'Blood sample',
      Picture = '',
      Weight = 200,
      Type = 'dna',
      Useable = false,
      ShouldClose = false,
      Unique = true,
      Combinable = false,
      Description = 'Blood sample taken from someone'
    },
    BloodSampleReport = { -- Item given when player prints blood sample report.
      Name = 'bloodsamplereport',
      Label = 'Blood sample report',
      Picture = '',
      Weight = 200,
      Type = 'item',
      Useable = true,
      ShouldClose = true,
      Unique = true,
      Combinable = false,
      Description = 'A report comparing 2 blood samples'
    },
  }

}
