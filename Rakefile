# Download the shapefile
file "US_AtlasHCB_StateTerr_Gen01.zip" do
  system %[curl -O http://publications.newberry.org/ahcbp/downloads/gis/US_AtlasHCB_StateTerr_Gen01.zip]
end

# Unzip the shapefile
directory "US_AtlasHCB_StateTerr_Gen01" => ["US_AtlasHCB_StateTerr_Gen01.zip"] do
  system %[unzip US_AtlasHCB_StateTerr_Gen01.zip]
end


file "us.json" => ["US_AtlasHCB_StateTerr_Gen01"] do
  system %[topojson --id-property ID -p -o us.json states=US_AtlasHCB_StateTerr_Gen01/US_HistStateTerr_Gen01_Shapefile/US_HistStateTerr_Gen01.shp]
end

task :default => ["us.json"]

require "rake/clean"

CLEAN.include("US_AtlasHCB_StateTerr_Gen01.zip", 
              "US_AtlasHCB_StateTerr_Gen01")

CLOBBER.include("us.json")

