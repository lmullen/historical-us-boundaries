# US boundaries 
file "US_AtlasHCB_StateTerr_Gen01.zip" do
  system %[curl -O http://publications.newberry.org/ahcbp/downloads/gis/US_AtlasHCB_StateTerr_Gen01.zip]
end

file "US_AtlasHCB_StateTerr_Gen01" => ["US_AtlasHCB_StateTerr_Gen01.zip"] do |t|
  system %[unzip -o #{t.prerequisites.first}]
end

file "us.json" => ["US_AtlasHCB_StateTerr_Gen01"] do
  system %[topojson -e cw.csv --id-property ID -p -o us.json \
  states=US_AtlasHCB_StateTerr_Gen01/US_HistStateTerr_Gen01_Shapefile/US_HistStateTerr_Gen01.shp]
end

# Coastline
file "ne_50m_coastline.zip" do
  system %[curl -O http://www.nacis.org/naturalearth/50m/physical/ne_50m_coastline.zip]
end

file "ne_50m_coastline" => ["ne_50m_coastline.zip"] do |t|
  system %[unzip -o #{t.prerequisites.first} -d #{t.name}]
end

file "coast.json" => ["ne_50m_coastline"] do 
  # Clip to area around US
  system %[ogr2ogr -f "ESRI Shapefile" ocean_clipped \
           ne_50m_coastline/ne_50m_coastline.shp \
           -clipsrc -129, 22, -59, 54]
  system %[topojson -o coast.json coast=ocean_clipped/ne_50m_coastline.shp]
end

results = FileList["us.json", "coast.json"]

task :default => results

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

CLEAN.include("US_AtlasHCB_StateTerr_Gen01",
             "ocean_clipped*",
             "ne_50m_coastline",
             "DC_AtlasHCB")

CLOBBER.include("*.json")


