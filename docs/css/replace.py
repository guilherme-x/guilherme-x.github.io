fin = open("style.css", "rt")
#output file to write the result to
fout = open("style2.css", "wt")
#for each line in the input file
for line in fin:
	#read replace the string and write to output file
	fout.write(line.replace('#bac964', '#B654FF'))
#close input and output files
fin.close()
fout.close()
