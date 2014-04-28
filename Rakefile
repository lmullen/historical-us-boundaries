# Download the US boundaries shapefile
file "US_AtlasHCB_StateTerr_Gen01.zip" do
  system %[curl -O http://publications.newberry.org/ahcbp/downloads/gis/US_AtlasHCB_StateTerr_Gen01.zip]
end

# Download the coastline shapefile
file "ne_50m_coastline.zip" do
  system %[curl -O http://www.nacis.org/naturalearth/50m/physical/ne_50m_coastline.zip]
end

# Unzip the US boundaries shapefile
directory "US_AtlasHCB_StateTerr_Gen01" => ["US_AtlasHCB_StateTerr_Gen01.zip"] do
  system %[unzip -o US_AtlasHCB_StateTerr_Gen01.zip]
end

# Unzip the coastline shapefile
file "ne_50m_coastline/ne_50m_coastline.shp" => ["ne_50m_coastline.zip"] do
  system %[unzip -o ne_50m_coastline.zip -d ne_50m_coastline]
end

file "us.json" => ["US_AtlasHCB_StateTerr_Gen01"] do
  system %[topojson --id-property ID -p -o us.json states=US_AtlasHCB_StateTerr_Gen01/US_HistStateTerr_Gen01_Shapefile/US_HistStateTerr_Gen01.shp]
end

file "coast.json" => ["ne_50m_coastline/ne_50m_coastline.shp"] do 
  # Just North America
  # system %[ogr2ogr -f "ESRI Shapefile" ocean_clipped \
  #          ne_50m_coastline/ne_50m_coastline.shp \
  #          -clipsrc -167.2764, 5.4995, -52.2330, 83.1621]
  system %[topojson -o coast.json coast=ne_50m_coastline/ne_50m_coastline.shp]
end

task :data => ["us.json", "coast.json"]

task :default => :deploy

desc "Push the project to lincolnmullen.com"
task :deploy do

  ssh_port       = "22"
  ssh_user       = "reclaim"
  rsync_delete   = true
  rsync_options  = "--progress --stats -avze"
  public_dir     = "." 
  document_root  = "~/public_html/lincolnmullen.com/projects/us-boundaries"
  
  exclude = ""
  if File.exists?('./rsync-exclude')
    exclude = "--exclude-from '#{File.expand_path('./rsync-exclude')}'"
  end

  system("rsync #{rsync_options} 'ssh -p #{ssh_port}' #{exclude} #{"--delete" unless rsync_delete == false} #{public_dir}/ #{ssh_user}:#{document_root}")

end

require "rake/clean"

CLEAN.include("US_AtlasHCB_StateTerr_Gen01.zip", 
              "US_AtlasHCB_StateTerr_Gen01",
             "ocean_clipped*",
             "ne_50m_coastline",
             "ne_50m_coastline.zip")

CLOBBER.include("us.json", "coast.json")

